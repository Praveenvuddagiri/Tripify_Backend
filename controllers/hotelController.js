const Hotel = require('../models/hotel');

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const whereCaluse = require('../utils/whereClause');

exports.addHotel = Bigpromise(async (req, res, next) => {
    let govtDoc;
    let images = [];

    if (typeof req.body.data === "string") {
        req.body.data = JSON.parse(req.body.data);
    }

    if (req.files && req.files['images[]']) {
        req.files.images = req.files['images[]']
        req.files['images[]'] = undefined;
    }


    if (!req.files || !req.files.images || !req.files.governmentAuthorizedLicense) {
        return next(new CustomError("Documents are required", 401));
    }

    if (req.files) {
        let file1 = req.files.images;

        let file2 = req.files.governmentAuthorizedLicense;

        if (file2.mimetype !== 'application/pdf') {
            return next(new CustomError("For government authorized license PDF format is expected.", 401))
        }


        for (let index = 0; index < file1.length; index++) {
            const img = file1[index];

            let result = await cloudinary.v2.uploader.upload(img.tempFilePath, {
                folder: "hotels/images",
            });

            images.push({
                id: result.public_id,
                secure_url: result.secure_url
            })

        }


        let result = await cloudinary.v2.uploader.upload(file2.tempFilePath, {
            folder: "hotels/licenses",
        });
        govtDoc = ({
            id: result.public_id,
            secure_url: result.secure_url
        })

    }
    req.body.data.images = images;
    req.body.data.governmentAuthorizedLicense = govtDoc;

    // //temporary
    // res.status(200).json({
    //     success: true,
    //     images,
    //     governmentAuthorizedLicense: govtDoc
    // })

    req.body.data.serviceProvider = req.user._id;

    const hotel = await Hotel.create(req.body.data);

    res.status(200).json({
        success: true,
        hotel,
    })
})

exports.getAllHotels = Bigpromise(async (req, res, next) => {
    const resultPerPage = 6;
    const totalHotelCount = await Hotel.countDocuments()

    req.query.isApproved = true;

    const Obj = await new whereCaluse(Hotel.find(), req.query).search().filter().sort();

    let hotels = await Obj.base
    const filteredNumber = hotels.length;
    Obj.pager(resultPerPage);

    hotels = await Obj.base.clone();


    hotels = hotels.map((hot) => {
        hot.governmentAuthorizedLicense = undefined;
        return hot;
    })


    res.status(200).json({
        success: true,
        hotels,
        filteredNumber,
        totalHotelCount
    })
})

exports.getNearbyHotels = Bigpromise(async (req, res, next) => {
    let { lat, long, maxRad } = req.body;

    console.log(req.body);

    lat = Number(lat);
    long = Number(long);
    maxRad = Number(maxRad);

    var hotels = await Hotel.find({
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


    hotels = hotels.map((hot) => {
        hot.governmentAuthorizedLicense = undefined;
        return hot;
    })



    hotels = hotels.filter((hotel) => hotel.isApproved === true);


    res.status(200).json({
        success: true,
        hotels,
    })
})

exports.getHotelsPerServiceProvider = Bigpromise(async (req, res, next) => {

    const resultPerPage = 6;
    const totalHotelCount = await Hotel.countDocuments()

    req.query.serviceProvider = req.user._id;


    const Obj = await new whereCaluse(Hotel.find(), req.query).search().filter();

    let hotels = await Obj.base

    Obj.pager(resultPerPage);

    hotels = await Obj.base.clone();

    const filteredNumber = hotels.length;
    res.status(200).json({
        success: true,
        hotels,
        filteredNumber,
        totalHotelCount
    })

})

exports.getHotelById = Bigpromise(async (req, res, next) => {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel === null) {
        return next(new CustomError("No Hotel found", 401));
    }
    res.status(200).json({
        success: true,
        hotel
    })
})

exports.deleteHotelById = Bigpromise(async (req, res, next) => {

    const hotel = await Hotel.findById(req.params.id);
    if (hotel === null) {
        return next(new CustomError("No Hotel found", 401));
    }

    if (req.user.role !== "admin") {
        if (hotel.serviceProvider.toString() !== req.user._id.toString()) {
            return next(new CustomError("You are not allowed to delete this resource.", 401));
        }
    }


    for (let index = 0; index < hotel.images.length; index++) {
        const imgId = hotel.images[index].id;
        await cloudinary.v2.uploader.destroy(imgId);
    }

    imageId = hotel.governmentAuthorizedLicense.id;
    await cloudinary.v2.uploader.destroy(imageId);


    await hotel.remove()

    res.status(200).json({
        success: true,
        message: "Deleted the hotel successfully."
    })
})

exports.updateHotel = Bigpromise(async (req, res, next) => {
    let hotel = await Hotel.findById(req.params.id)

    if (hotel === null) {
        return next(new CustomError("No Hotel found", 400));
    }

    if (req.user.role !== "admin") {
        if (hotel.serviceProvider.toString() !== req.user._id.toString()) {
            return next(new CustomError("You are not allowed to update this resource.", 401));
        }
    }


    if (typeof req.body.data === "string") {
        req.body.data = JSON.parse(req.body.data);
    }

    if (req.files && req.files['images[]']) {
        req.files.images = req.files['images[]']
        req.files['images[]'] = undefined;
    }

    let images = []

    if (!req.body.data) {
        req.body.data = {};
    }

    if (req.files) {

        if (req.files.images) {
            for (let index = 0; index < hotel.images.length; index++) {
                const imgId = hotel.images[index].id;
                await cloudinary.v2.uploader.destroy(imgId);
            }

            let file1 = req.files.images;
            for (let index = 0; index < file1.length; index++) {
                const img = file1[index];

                let result = await cloudinary.v2.uploader.upload(img.tempFilePath, {
                    folder: "hotels/images",
                });

                images.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                })

            }

            req.body.data.images = images;

        }

        if (req.files.governmentAuthorizedLicense) {
            const imageId = hotel.governmentAuthorizedLicense.id;
            await cloudinary.v2.uploader.destroy(imageId);


            let file = req.files.governmentAuthorizedLicense;
            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "hotels/licenses",
            });
            req.body.data.governmentAuthorizedLicense = ({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }

    }


    hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.id }, // Find the document to update by ID
        { $set: req.body.data }, // Update the fields specified in newData
        { new: true, useFindAndModify: false } // Return the updated document
    );


    res.status(200).json({
        success: true,
        hotel
    });
})

exports.approveHotel = Bigpromise(async (req, res, next) => {
    let hotel = await Hotel.findById(req.params.id)

    if (hotel === null) {
        return next(new CustomError("No hotel found", 400));
    }

    hotel.isApproved = true;

    hotel.save();

    res.status(200).json({
        success: true,
        message: "Approved the hotel."
    })
})

exports.unapproveHotel = Bigpromise(async (req, res, next) => {
    let hotel = await Hotel.findById(req.params.id)

    if (hotel === null) {
        return next(new CustomError("No Hotel found", 400));
    }

    hotel.isApproved = false;

    hotel.save();

    res.status(200).json({
        success: true,
        message: "Unapproved the hotel."
    })
})


exports.getUnapprovedHotels = Bigpromise(async (req, res, next) => {
    let hotels = await Hotel.find({ isApproved: false })

    res.status(200).json({
        success: true,
        hotels
    })
})


exports.getAllHotelsForAdmin = Bigpromise(async (req, res, next) => {
    let hotels = await Hotel.find()

    res.status(200).json({
        success: true,
        hotels
    })
})

//review module


exports.addReview = Bigpromise(async (req, res, next) => {
    const { rating, comment, hotelId } = req.body



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


    let hotel = await Hotel.findById(hotelId)

    const AlreadyReview = hotel.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if (AlreadyReview) {
        hotel.reviews.forEach((review) => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment
                review.rating = rating
                review.sentiment = sentiment
                review.date = Date.now()
            }
        })
    } else {
        hotel.reviews.push(review)
        hotel.numberOfReviews = hotel.reviews.length;
    }

    hotel.ratings = hotel.reviews.reduce((acc, item) => item.rating + acc, 0) / hotel.reviews.length

    await hotel.save({ validateBeforeSave: false })
    res.status(200).json({
        success: true
    })
})

exports.deleteReview = Bigpromise(async (req, res, next) => {
    const hotelId = req.query.id;

    let hotel = await Hotel.findById(hotelId)

    if (hotel.reviews.length === 0) {
        return next(new CustomError("No review found on this user.", 401));
    }

    const reviews = hotel.reviews.filter(
        (rev) => rev.user.toString() !== req.user._id.toString()
    )

    const numberOfReviews = reviews.length;
    let ratings =
        Number(reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length);

    if (!ratings) {
        ratings = 0;
    }

    await Hotel.findByIdAndUpdate(hotelId, {
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

exports.getOnlyReviewsForOneHotel = Bigpromise(async (req, res, next) => {
    const hotelId = req.query.id;

    let hotel = await Hotel.findById(hotelId)


    let stars = hotel.reviews.filter((rev) => rev.rating === 1)
    let oneCount = stars.length;

    stars = hotel.reviews.filter((rev) => rev.rating === 2)
    let twoCount = stars.length;

    stars = hotel.reviews.filter((rev) => rev.rating === 3)
    let threeCount = stars.length;

    stars = hotel.reviews.filter((rev) => rev.rating === 4)
    let fourCount = stars.length;

    stars = hotel.reviews.filter((rev) => rev.rating === 5)
    let fiveCount = stars.length;

    stars = hotel.reviews.filter((rev) => rev.sentiment === 'Positive')
    let positiveResponse = stars.length;

    stars = hotel.reviews.filter((rev) => rev.sentiment === 'Negative')
    let negativeResponse = stars.length;

    stars = hotel.reviews.filter((rev) => rev.sentiment === 'Neutral')
    let neutralResponse = stars.length;



    res.status(200).json({
        success: true,
        reviews: hotel.reviews,
        oneCount,
        twoCount,
        threeCount,
        fourCount,
        fiveCount,
        positiveResponse,
        negativeResponse,
        neutralResponse,
        numberOfReviews: hotel.numberOfReviews,
        ratingsAverage: hotel.ratings
    })
})

exports.getReviewOnePersonOneHotel = Bigpromise(async (req, res, next) => {
    const hotelId = req.query.id;

    let hotel = await Hotel.findById(hotelId)

    if (!hotel) {
        return next(new CustomError("No review found.", 400))
    }

    const UserReview = hotel.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if (!UserReview) {
        return next(new CustomError("No review found.", 400))
    }


    res.status(200).json({
        success: true,
        review: UserReview,

    })
})