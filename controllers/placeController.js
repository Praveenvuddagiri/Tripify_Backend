const Place = require('../models/place');

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const whereCaluse = require('../utils/whereClause');


exports.addPlace = Bigpromise(async (req, res, next) => {
    // let imageArray = []

    // if (!req.files) {
    //     return next(new CustomError("Images are required", 401));
    // }

    // if (req.files) {
    //     for (let index = 0; index < req.files.images.length; index++) {
    //         let file = req.files.images[index];
    //         let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    //             folder: "places",
    //         });
    //         imageArray.push({
    //             id: result.public_id,
    //             secure_url: result.secure_url
    //         })
    //     }

    // }
    // console.log(imageArray);
    // req.body.images = imageArray;
    // res.status(200).json({
    //         success: true,
    //     })
    
    const place = await Place.create(req.body);

    res.status(200).json({
        success: true,
        place,
    })
})

exports.getAllPlaces = Bigpromise(async (req, res, next) => {
    const resultPerPage = 6;
    const totalPlaceCount = await Place.countDocuments()



    const placesObj = await new whereCaluse(Place.find(), req.query).search().categoryFilter().filter();

    let places = await placesObj.base
    const filteredPlaceNumber = places.length;
    placesObj.pager(resultPerPage);

    places = await placesObj.base.clone();


    res.status(200).json({
        success: true,
        places,
        filteredPlaceNumber,
        totalPlaceCount
    })
})

exports.getPlaceById = Bigpromise(async (req, res, next) => {
    const place = await Place.findById(req.params.id);

    if (place === null) {
        return next(new CustomError("No place found", 401));
    }
    res.status(200).json({
        success: true,
        place,
    })
})


exports.getPlacesNearby = Bigpromise(async (req, res, next) => {

    let {lat, long, maxRad} = req.body;

    lat = Number(lat);
    long = Number(long);
    maxRad = Number(maxRad);

    const places = await Place.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [long, lat]
            },
            $maxDistance: maxRad // distance in meters, you can adjust this to your needs
          }
        }
      })
    
    res.status(200).json({
        success: true,
        places,
    })
})

exports.adminDeletePlaceById = Bigpromise(async (req, res, next) => {

    const place = await Place.findById(req.params.id);
    console.log(place.images);
    if (place === null) {
        return next(new CustomError("No place found", 401));
    }


    for (let index = 0; index < place.images.length; index++) {
        const imageId = place.images[index].id;
        await cloudinary.v2.uploader.destroy(imageId);
    }

    await place.remove()

    res.status(200).json({
        success: true
    })
})

exports.adminUpdatePlace = Bigpromise(async (req, res, next) => {
    const placeId = req.params.id;

    let place = await Place.findById(placeId)
    let imageArray = []

    if (place === null) {
        return next(new CustomError("No place found", 400));
    }

    if (req.files) {

        for (let index = 0; index < place.images.length; index++) {
            const imageId = place.images[index].id;
            await cloudinary.v2.uploader.destroy(imageId);
        }

        for (let index = 0; index < req.files.images.length; index++) {
            let file = req.files.images[index];
            let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "places",
            });
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }

    }

    if (imageArray.length !== 0)
        req.body.images = imageArray;


    place = await Place.findOneAndUpdate(
        { _id: placeId }, // Find the document to update by ID
        { $set: req.body }, // Update the fields specified in newData
        { new: true, useFindAndModify: false } // Return the updated document
    );


    res.status(200).json({
        success: true,
        place
    });
})


//reviews
exports.addReview = Bigpromise(async (req, res, next) => {
    const { rating, comment, placeId } = req.body


    //sentiment analysis
    let sentiment;
    var Sentiment = require('sentiment');
    var sentiAlgo = new Sentiment();
    let sentimentScore = sentiAlgo.analyze(comment);
    sentimentScore = sentimentScore.score;


    if (sentimentScore > 0) {
        sentiment = 'Positive';
    } else if (sentimentScore < 0) {
        sentiment = 'Negative';
    } else {
        sentiment = 'Neutral';
    }




    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
        sentiment: sentiment
    }


    let place = await Place.findById(placeId)

    const AlreadyReview = place.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if (AlreadyReview) {
        place.reviews.forEach((review) => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment
                review.rating = rating
                review.sentiment = sentiment
            }
        })
    } else {
        place.reviews.push(review)
        place.numberOfReviews = place.reviews.length;
    }

    place.ratings = place.reviews.reduce((acc, item) => item.rating + acc, 0) / place.reviews.length

    await place.save({ validateBeforeSave: false })
    res.status(200).json({
        success: true
    })
})

exports.deleteReview = Bigpromise(async (req, res, next) => {
    const placeId = req.query.id;

    let place = await Place.findById(placeId)

    if (place.reviews.length === 0) {
        return next(new CustomError("No review found on this user.", 401));
    }

    const reviews = place.reviews.filter(
        (rev) => rev.user.toString() !== req.user._id.toString()
    )

    const numberOfReviews = reviews.length;
    let ratings =
        Number(reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length);

    if (!ratings) {
        ratings = 0;
    }

    await Place.findByIdAndUpdate(placeId, {
        reviews,
        ratings,
        numberOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
})

exports.getOnlyReviewsForOnePlace = Bigpromise(async (req, res, next) => {
    const placeId = req.query.id;

    let place = await Place.findById(placeId)


    let stars = place.reviews.filter((rev) => rev.rating === 1)
    let oneCount = stars.length;

    stars = place.reviews.filter((rev) => rev.rating === 2)
    let twoCount = stars.length;

    stars = place.reviews.filter((rev) => rev.rating === 3)
    let threeCount = stars.length;

    stars = place.reviews.filter((rev) => rev.rating === 4)
    let fourCount = stars.length;

    stars = place.reviews.filter((rev) => rev.rating === 5)
    let fiveCount = stars.length;

    stars = place.reviews.filter((rev) => rev.sentiment === 'Positive')
    let positiveResponse = stars.length;

    stars = place.reviews.filter((rev) => rev.sentiment === 'Negative')
    let negativeResponse = stars.length;

    stars = place.reviews.filter((rev) => rev.sentiment === 'Neutral')
    let neutralResponse = stars.length;



    res.status(200).json({
        success: true,
        reviews: place.reviews,
        oneCount,
        twoCount,
        threeCount,
        fourCount,
        fiveCount,
        positiveResponse,
        negativeResponse,
        neutralResponse,
        numberOfReviews: place.numberOfReviews,
        ratingsAverage: place.ratings
    })
})

exports.getReviewOnePersonOnePlace = Bigpromise(async (req, res, next) => {
    const placeId = req.query.id;

    let place = await Place.findById(placeId)

    const UserReview = place.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if(!UserReview){
        return next(new CustomError("No review found.",400))
    }


    res.status(200).json({
        success: true,
        review: UserReview,
        
    })
})