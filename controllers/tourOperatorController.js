const TourOperator = require('../models/tourOperator');

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const whereCaluse = require('../utils/whereClause');

exports.addTourOperator = Bigpromise(async (req, res, next) => {
    let image, govtDoc, tariff;

    if (!req.files) {
        return next(new CustomError("Documents are required", 401));
    }

    if (req.files) {
        let file = req.files.image;
        let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "tour_operators/company_logo",
        });
        image = ({
            id: result.public_id,
            secure_url: result.secure_url
        })

        file = req.files.governmentAuthorizedLicense;
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "tour_operators/licenses",
        });
        govtDoc = ({
            id: result.public_id,
            secure_url: result.secure_url
        })

        file = req.files.tariffDocument;
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "tour_operators/tariffs",
        });
        tariff = ({
            id: result.public_id,
            secure_url: result.secure_url
        })

    }
    console.log({ image, govtDoc, tariff });
    req.body.image = image;
    req.body.governmentAuthorizedLicense = govtDoc;
    req.body.tariffDocument = tariff;
    res.status(200).json({
        success: true,
        image,
        govtDoc,
        tariff
    })

    const tourOperator = await TourOperator.create(req.body);

    res.status(200).json({
        success: true,
        tourOperator,
    })
})

exports.getAllTourOperators = Bigpromise(async (req, res, next) => {
    const resultPerPage = 6;
    const totalTourOperatorCount = await TourOperator.countDocuments()



    const Obj = await new whereCaluse(TourOperator.find(), req.query).search();

    let tourOperators = await Obj.base
    const filteredNumber = tourOperators.length;
    Obj.pager(resultPerPage);

    tourOperators = await Obj.base.clone();


    res.status(200).json({
        success: true,
        places,
        filteredNumber,
        totalTourOperatorCount
    })
})

exports.getTourOperatorById = Bigpromise(async (req, res, next) => {
    const tourOperator = await TourOperator.findById(req.params.id);

    if (tourOperator === null) {
        return next(new CustomError("No Tour Operator found", 401));
    }
    res.status(200).json({
        success: true,
        tourOperator,
    })
})

exports.deleteTourOperatorById = Bigpromise(async (req, res, next) => {

    const tourOperator = await TourOperator.findById(req.params.id);
    if (tourOperator === null) {
        return next(new CustomError("No Tour operator found", 401));
    }


    const imageId = tourOperator.image.id;
    await cloudinary.v2.uploader.destroy(imageId);
    imageId = tourOperator.governmentAuthorizedLicense.id;
    await cloudinary.v2.uploader.destroy(imageId);
    imageId = tourOperator.tariffDocument.id;
    await cloudinary.v2.uploader.destroy(imageId);


    await tourOperator.remove()

    res.status(200).json({
        success: true
    })
})

exports.updateTourOperator = Bigpromise(async (req, res, next) => {
    let tourOperator = await TourOperator.findById(req.params.id)

    if (tourOperator === null) {
        return next(new CustomError("No Tour Operator found", 400));
    }

    if (req.files) {

        if (req.files.image) {
            const imageId = tourOperator.image.id;
            await cloudinary.v2.uploader.destroy(imageId);


            let file = req.files.image;
            let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "tour_operators/company_logo",
            });
            req.body.image = ({
                id: result.public_id,
                secure_url: result.secure_url
            })

        }

        if (req.files.governmentAuthorizedLicense) {
            const imageId = tourOperator.governmentAuthorizedLicense.id;
            await cloudinary.v2.uploader.destroy(imageId);


            let file = req.files.governmentAuthorizedLicense;
            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "tour_operators/licenses",
            });
            req.body.governmentAuthorizedLicense = ({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }


        if (req.files.tariffDocument) {
            const imageId = tourOperator.tariffDocument.id;
            await cloudinary.v2.uploader.destroy(imageId);


            let file = req.files.tariffDocument;
            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "tour_operators/tariffs",
            });
            tariff = ({
                id: result.public_id,
                secure_url: result.secure_url
            })

        }

    }


    tourOperator = await TourOperator.findOneAndUpdate(
        { _id: req.params.id }, // Find the document to update by ID
        { $set: req.body }, // Update the fields specified in newData
        { new: true, useFindAndModify: false } // Return the updated document
    );


    res.status(200).json({
        success: true,
        tourOperator
    });
})


exports.approveTourOperator = Bigpromise(async (req, res, next) => {
    let tourOperator = await TourOperator.findById(req.params.id)

    if (tourOperator === null) {
        return next(new CustomError("No Tour Operator found", 400));
    }

    tourOperator.isApproved = true;

    tourOperator.save();

    res.status(200).json({
        success: true,
        tourOperator
    })
})


exports.getUnapprovedTourOperators = Bigpromise(async (req, res, next) => {
    let tourOperators = await TourOperator.find({isApproved: false})

    res.status(200).json({
        success: true,
        tourOperators
    })
})


