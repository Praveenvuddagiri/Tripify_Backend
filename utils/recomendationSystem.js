
const Place = require('../models/place');
const ContentBasedRecommender = require('content-based-recommender')




exports.DescriptionBasedRecommender = async (placeId) => {
    const places = await Place.find();
    const recommender = new ContentBasedRecommender({
        minScore: 0.1,
        maxSimilarDocuments: 100
    });

    // prepare documents data
    const documents = places.map((place) => {
        {
            id : place._id
            content: place.description
        }
    })

    console.log(documents);

    // start training
    recommender.train(documents);

    //get top 10 similar items to document 1000002
    const similarPlaces = recommender.getSimilarDocuments(placeId, 0, 6);

    return similarPlaces;

}
