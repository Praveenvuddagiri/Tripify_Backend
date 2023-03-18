const TourOperator = require('../models/tourOperator');

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const whereCaluse = require('../utils/whereClause');

exports.addTourOperator = Bigpromise(async (req, res, next) => {
    // let image, govtDoc, tariff;

    // console.log(req.body);

    // if (!req.files || !req.files.image || ! req.files.governmentAuthorizedLicense || !req.files.tariffDocument) {
    //     return next(new CustomError("Documents are required", 401));
    // }

    // if (req.files) {
    //     let file1 = req.files.image;

    //     let file2 = req.files.governmentAuthorizedLicense;

    //     if (file2.mimetype !== 'application/pdf') {
    //         return next(new CustomError("For government authorized license PDF format is expected.",401))
    //     }

    //     let file3 = req.files.tariffDocument;

    //     if (file3.mimetype !== 'application/pdf') {
    //         return next(new CustomError("For Tariff PDF format is expected.",401))
    //     }


    //     let result = await cloudinary.v2.uploader.upload(file1.tempFilePath, {
    //         folder: "tour_operators/company_logo",
    //     });
    //     image = ({
    //         id: result.public_id,
    //         secure_url: result.secure_url
    //     })

        
    //     result = await cloudinary.v2.uploader.upload(file2.tempFilePath, {
    //         folder: "tour_operators/licenses",
    //     });
    //     govtDoc = ({
    //         id: result.public_id,
    //         secure_url: result.secure_url
    //     })

        
    //     result = await cloudinary.v2.uploader.upload(file3.tempFilePath, {
    //         folder: "tour_operators/tariffs",
    //     });
    //     tariff = ({
    //         id: result.public_id,
    //         secure_url: result.secure_url
    //     })

    // }
    // console.log({ image, govtDoc, tariff });
    // req.body.image = image;
    // req.body.governmentAuthorizedLicense = govtDoc;
    // req.body.tariffDocument = tariff;

    // //temporary
    // res.status(200).json({
    //     success: true,
    //     image,
    //     governmentAuthorizedLicense: govtDoc,
    //     tariffDocument: tariff
    // })

    req.body.serviceProvider = req.user._id;

    const tourOperator = await TourOperator.create(req.body);

    res.status(200).json({
        success: true,
        tourOperator,
    })
})

exports.getAllTourOperators = Bigpromise(async (req, res, next) => {
    const resultPerPage = 6;
    const totalTourOperatorCount = await TourOperator.countDocuments()

    console.log(totalTourOperatorCount);

    req.query.isApproved = true;

    console.log(req.query);

    const Obj = await new whereCaluse(TourOperator.find(), req.query).search().filter();

    let tourOperators = await Obj.base
    const filteredNumber = tourOperators.length;
    Obj.pager(resultPerPage);

    tourOperators = await Obj.base.clone();


    res.status(200).json({
        success: true,
        tourOperators,
        filteredNumber,
        totalTourOperatorCount
    })
})

exports.getTourOperatorsPerServiceProvider = Bigpromise(async (req, res, next) => {

    const resultPerPage = 6;
    const totalTourOperatorCount = await TourOperator.countDocuments()

    req.query.serviceProvider = req.user._id;

    console.log(req.query);

    const Obj = await new whereCaluse(TourOperator.find(), req.query).search().filter();

    let tourOperators = await Obj.base
    const filteredNumber = tourOperators.length;
    Obj.pager(resultPerPage);

    tourOperators = await Obj.base.clone();


    res.status(200).json({
        success: true,
        tourOperators,
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

    if(req.user.role !== "admin"){

        if(tourOperator.serviceProvider.toString() !== req.user._id.toString()){
            return next(new CustomError("You are not allowed to delete this resource.", 401));
        }
    }




    let imageId = tourOperator.image.id;
    await cloudinary.v2.uploader.destroy(imageId);
    imageId = tourOperator.governmentAuthorizedLicense.id;
    await cloudinary.v2.uploader.destroy(imageId);
    imageId = tourOperator.tariffDocument.id;
    await cloudinary.v2.uploader.destroy(imageId);


    await tourOperator.remove()

    res.status(200).json({
        success: true,
        message: "Deleted the tour operator successfully."
    })
})

exports.updateTourOperator = Bigpromise(async (req, res, next) => {
    let tourOperator = await TourOperator.findById(req.params.id)

    if (tourOperator === null) {
        return next(new CustomError("No Tour Operator found", 400));
    }

    if(req.user.role !== "admin"){
        if(tourOperator.serviceProvider.toString() !== req.user._id.toString()){
            return next(new CustomError("You are not allowed to update this resource.", 401));
        }
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
        message: "Approved the tour operator."
    })
})

exports.unapproveTourOperator = Bigpromise(async (req, res, next) => {
    let tourOperator = await TourOperator.findById(req.params.id)

    if (tourOperator === null) {
        return next(new CustomError("No Tour Operator found", 400));
    }

    tourOperator.isApproved = false;

    tourOperator.save();

    res.status(200).json({
        success: true,
        message: "Unapproved the tour operator."
    })
})


exports.getUnapprovedTourOperators = Bigpromise(async (req, res, next) => {
    let tourOperators = await TourOperator.find({isApproved: false})

    res.status(200).json({
        success: true,
        tourOperators
    })
})


exports.getAllTourOperatorsForAdmin = Bigpromise(async (req, res, next) => {
    let tourOperators = await TourOperator.find()

    res.status(200).json({
        success: true,
        tourOperators
    })
})
