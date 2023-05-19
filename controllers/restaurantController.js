const Restaurant = require('../models/restaurant');

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const whereCaluse = require('../utils/whereClause');

exports.addRestaurant = Bigpromise(async (req, res, next) => {
    let govtDoc, menu;
    let imageArray = [];

    if(typeof req.body.data === "string"){
        req.body.data = JSON.parse(req.body.data);
    }

    if (req.files && req.files['images[]']) {
        req.files.images = req.files['images[]']
        req.files['images[]'] = undefined;
    }



    if (!req.files || !req.files.images || !req.files.governmentAuthorizedLicense || !req.files.menu) {
        return next(new CustomError("Documents are required", 401));
    }

    if (req.files) {
        let file1 = req.files.images;

        let file2 = req.files.governmentAuthorizedLicense;

        if (file2.mimetype !== 'application/pdf') {
            return next(new CustomError("For government authorized license PDF format is expected.", 401))
        }

        let file3 = req.files.menu;

        if (file3.mimetype !== 'application/pdf') {
            return next(new CustomError("For Menu PDF format is expected.", 401))
        }


        for (let index = 0; index < file1.length; index++) {
            const img = file1[index];

            let result = await cloudinary.v2.uploader.upload(img.tempFilePath, {
                folder: "restaurants/images",
            });

            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })

        }


        result = await cloudinary.v2.uploader.upload(file2.tempFilePath, {
            folder: "restaurants/licenses",
        });
        govtDoc = ({
            id: result.public_id,
            secure_url: result.secure_url
        })


        result = await cloudinary.v2.uploader.upload(file3.tempFilePath, {
            folder: "restaurants/menus",
        });
        menu = ({
            id: result.public_id,
            secure_url: result.secure_url
        })

    }
    req.body.data.images = imageArray;
    req.body.data.governmentAuthorizedLicense = govtDoc;
    req.body.data.menu = menu;

    // //temporary
    // res.status(200).json({
    //     success: true,
    //     images: imageArray,
    //     governmentAuthorizedLicense: govtDoc,
    //     menu: menu
    // })

    req.body.data.serviceProvider = req.user._id;

    const restaurant = await Restaurant.create(req.body.data);

    res.status(200).json({
        success: true,
        restaurant
    })
})

exports.getAllRestaurants = Bigpromise(async (req, res, next) => {
    const resultPerPage = 6;
    const totalRestaurantCount = await Restaurant.countDocuments()


    req.query.isApproved = true;


    const Obj = await new whereCaluse(Restaurant.find(), req.query).search().filter();

    let restaurants = await Obj.base
    const filteredNumber = restaurants.length;
    Obj.pager(resultPerPage);

    restaurants = await Obj.base.clone();


    restaurants = restaurants.map((to) => {
        to.governmentAuthorizedLicense = undefined;
        return to;
    })


    res.status(200).json({
        success: true,
        restaurants,
        filteredNumber,
        totalRestaurantCount
    })
})

exports.getNearbyRestaurants = Bigpromise(async (req, res, next) => {
    let { lat, long, maxRad } = req.body;

    if(!lat || !long || !maxRad){
        return next(new CustomError("Please provide the required parameters(latitude, longitude, maximum Radius) ", 401));
    }

    lat = Number(lat);
    long = Number(long);
    maxRad = Number(maxRad);

    var restaurants = await Restaurant.find({
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


    restaurants = restaurants.map((rest) => {
        rest.governmentAuthorizedLicense = undefined;
        return rest;
    })



    restaurants = restaurants.filter((rest) => rest.isApproved === true);


    res.status(200).json({
        success: true,
        restaurants,
    })
})

exports.getRestaurantsPerServiceProvider = Bigpromise(async (req, res, next) => {

    const resultPerPage = 6;
    const totalRestaurantCount = await Restaurant.countDocuments()

    req.query.serviceProvider = req.user._id;


    const Obj = await new whereCaluse(Restaurant.find(), req.query).search().filter();

    let restaurants = await Obj.base
    const filteredNumber = restaurants.length;
    Obj.pager(resultPerPage);

    restaurants = await Obj.base.clone();


    res.status(200).json({
        success: true,
        restaurants,
        filteredNumber,
        totalRestaurantCount
    })
})

exports.getRestaurantById = Bigpromise(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant === null) {
        return next(new CustomError("No Restaurant found", 401));
    }
    res.status(200).json({
        success: true,
        restaurant,
    })
})

exports.deleteRestaurantById = Bigpromise(async (req, res, next) => {



    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant === null) {
        return next(new CustomError("No Restaurant found", 401));
    }

    if (req.user.role !== "admin") {

        if (restaurant.serviceProvider.toString() !== req.user._id.toString()) {
            return next(new CustomError("You are not allowed to delete this resource.", 401));
        }
    }





    for (let i = 0; i < restaurant.images.length; i++) {
        let imageId = restaurant.images[i].id;
        await cloudinary.v2.uploader.destroy(imageId);
    }


    let imageId = restaurant.governmentAuthorizedLicense.id;
    await cloudinary.v2.uploader.destroy(imageId);
    imageId = restaurant.menu.id;
    await cloudinary.v2.uploader.destroy(imageId);


    await restaurant.remove()

    res.status(200).json({
        success: true,
        message: "Deleted the restaurant successfully."
    })
})

exports.updateRestaurant = Bigpromise(async (req, res, next) => {
    let restaurant = await Restaurant.findById(req.params.id)

    if (restaurant === null) {
        return next(new CustomError("No restaurant found", 400));
    }

    if (req.user.role !== "admin") {
        if (restaurant.serviceProvider.toString() !== req.user._id.toString()) {
            return next(new CustomError("You are not allowed to update this resource.", 401));
        }
    }

    if(typeof req.body.data === "string"){
        req.body.data = JSON.parse(req.body.data);
    }

    if (req.files && req.files['images[]']) {
        req.files.images = req.files['images[]']
        req.files['images[]'] = undefined;
    }

    if (!req.body.data) {
        req.body.data = {};
    }

    let images = []

    if (req.files) {

        if (req.files.images) {
            for (let i = 0; i < restaurant.images.length; i++) {
                let imageId = restaurant.images[i].id;
                await cloudinary.v2.uploader.destroy(imageId);
            }

            let file1 = req.files.images;
            for (let index = 0; index < file1.length; index++) {
                const img = file1[index];

                let result = await cloudinary.v2.uploader.upload(img.tempFilePath, {
                    folder: "restaurants/images",
                });

                images.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                })

                

            }
            req.body.data.images = images;

        }

        if (req.files.governmentAuthorizedLicense) {
            const imageId = restaurant.governmentAuthorizedLicense.id;
            await cloudinary.v2.uploader.destroy(imageId);


            let file = req.files.governmentAuthorizedLicense;
            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "restaurants/licenses",
            });
            req.body.data.governmentAuthorizedLicense = ({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }


        if (req.files.menu) {
            const imageId = restaurant.menu.id;
            await cloudinary.v2.uploader.destroy(imageId);


            let file = req.files.menu;
            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "restaurants/menus",
            });
            req.body.data.menu = ({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }

    }


    restaurant = await Restaurant.findOneAndUpdate(
        { _id: req.params.id }, // Find the document to update by ID
        { $set: req.body.data }, // Update the fields specified in newData
        { new: true, useFindAndModify: false } // Return the updated document
    );


    res.status(200).json({
        success: true,
        restaurant
    });
})

exports.approveRestaurant = Bigpromise(async (req, res, next) => {
    let restaurant = await Restaurant.findById(req.params.id)

    if (restaurant === null) {
        return next(new CustomError("No Restaurant found", 400));
    }

    restaurant.isApproved = true;

    restaurant.save();

    res.status(200).json({
        success: true,
        message: "Approved the Restaurant."
    })
})

exports.unapproveRestaurant = Bigpromise(async (req, res, next) => {
    let restaurant = await Restaurant.findById(req.params.id)

    if (restaurant === null) {
        return next(new CustomError("No Restaurant found", 400));
    }

    restaurant.isApproved = false;

    restaurant.save();

    res.status(200).json({
        success: true,
        message: "Unapproved the Restaurant."
    })
})


exports.getUnapprovedRestaurants = Bigpromise(async (req, res, next) => {
    let restaurants = await Restaurant.find({ isApproved: false })

    res.status(200).json({
        success: true,
        restaurants
    })
})


exports.getAllRestaurantsForAdmin = Bigpromise(async (req, res, next) => {
    let restaurants = await Restaurant.find()

    res.status(200).json({
        success: true,
        restaurants
    })
})
