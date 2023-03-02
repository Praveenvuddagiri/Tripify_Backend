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

