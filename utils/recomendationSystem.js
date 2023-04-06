const User = require('../models/user')
const Place = require('../models/place');
const ContentBasedRecommender = require('content-based-recommender')
const recommend = require('collaborative-filter');
const fs = require('fs');

exports.DescriptionBasedRecommender = async (placeId) => {

    // read the contents of the JSON file
    const recommender = new ContentBasedRecommender();
    const data = fs.readFileSync('recommenderObject.json');
    const object = JSON.parse(data);
    recommender.import(object);
    const similarPlaces = await recommender.getSimilarDocuments(placeId, 0, 10);

    return similarPlaces;
}

exports.trainDescriptionBasedRecommender = async () => {
    const places = await Place.find();
    const recommender = new ContentBasedRecommender({
        minScore: 0.1,
        maxSimilarDocuments: 100
    });

    // prepare documents data
    const documents = places.map((place) => {
        return {
            id: place._id.toString(),
            content: place.description
        }
    })

    // start training
    recommender.train(documents);

    const object = recommender.export();

    fs.writeFile('recommenderObject.json', JSON.stringify(object), (err) => {
        if (err)
            throw err;
        // console.log('Recommender object saved to file');
    });
}


exports.getRatingArray = async (loggedInUserId) => {
    const places = await Place.find();
    const users = await User.find();
    let ratings = [];
    let loggedInUserIndex;

    let placeIdForIndex = [];

    places.forEach((place) => placeIdForIndex.push(place._id))


    users.forEach(user => {
        let userPlace = []
        places.forEach(place => {
            let temp = place.reviews.find(
                (rev) => rev.user.toString() === user._id.toString()
            )
            userPlace.push(temp ? 1 : 0);
        })
        ratings.push(userPlace);
        userPlace = [];
        if(user._id.toString() === loggedInUserId){
            loggedInUserIndex = ratings.length-1;
        }
    });
     
    const coMatrix = recommend.coMatrix(ratings, ratings.length, ratings[0].length);
    const result = recommend.getRecommendations(ratings, coMatrix, loggedInUserIndex);
    let recommendedPlaces = []

    let requiredPlaceIds = []

    for (let index = 0; index < result.length; index++) {
        requiredPlaceIds.push(placeIdForIndex[result[index]]);
    }

    recommendedPlaces = await Place.find({_id: requiredPlaceIds})
    return recommendedPlaces;
}