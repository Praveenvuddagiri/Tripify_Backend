const Hotel = require('../models/hotel');

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const whereCaluse = require('../utils/whereClause');

exports.addHotel = Bigpromise(async (req, res, next) => {
    let govtDoc;
    let images = [];

    console.log(req.body);

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
    console.log({ images, govtDoc });
    req.body.images = images;
    req.body.governmentAuthorizedLicense = govtDoc;
    req.body.tariffDocument = tariff;

    //temporary
    res.status(200).json({
        success: true,
        images,
        governmentAuthorizedLicense: govtDoc
    })

    req.body.serviceProvider = req.user._id;

    const hotel = await Hotel.create(req.body);

    res.status(200).json({
        success: true,
        hotel,
    })
})

exports.getAllHotels = Bigpromise(async (req, res, next) => {
    const resultPerPage = 6;
    const totalHotelCount = await Hotel.countDocuments()

    req.query.isApproved = true;

    const Obj = await new whereCaluse(Hotel.find(), req.query).search().filter();

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

    lat = Number(lat);
    long = Number(long);
    maxRad = Number(maxRad);

    const hotels = await Hotel.find({
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
        if (tourOperator.serviceProvider.toString() !== req.user._id.toString()) {
            return next(new CustomError("You are not allowed to update this resource.", 401));
        }
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

        }

        if (req.files.governmentAuthorizedLicense) {
            const imageId = tourOperator.governmentAuthorizedLicense.id;
            await cloudinary.v2.uploader.destroy(imageId);


            let file = req.files.governmentAuthorizedLicense;
            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "hotels/licenses",
            });
            req.body.governmentAuthorizedLicense = ({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }

    }


    hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.id }, // Find the document to update by ID
        { $set: req.body }, // Update the fields specified in newData
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