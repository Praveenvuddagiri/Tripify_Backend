
const Place = require('../models/place');
const ContentBasedRecommender = require('content-based-recommender')
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
