const mongoose = require('mongoose');
const Service = require('../models/service')

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const whereCaluse = require('../utils/whereClause');
const Place = require('../models/place');

exports.addService = Bigpromise(async (req, res, next) => {
    let result;
    if (req.files) {
        let file = req.files.image
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "services",
        });
    }

    const { name, description } = req.body

    if (!name || !description) {
        return next(new CustomError('Name and description are required fields.', 400));
    }

    const service = await Service.create({
        name,
        description,
        image: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });

    res.status(200).json({
        success: true,
        service,
    })

})

exports.deleteService = Bigpromise(async (req, res, next) => {

    const service = await Service.findById(req.params.id);

    if (service === null) {
        return next(new CustomError("No service found", 401));
    }

    //check wheather the service is in use or not

    req.query.service = req.params.id;

    // const placesObj = await new whereCaluse(Place.find(), req.query).filter();
    
    // let places = await placesObj.base

    // if(places.length!==0){
    //     return next(new CustomError("Serive is used somewhere, cannot be deleted.", 401));
    // }


    const imageId = service.image.id;

    await cloudinary.v2.uploader.destroy(imageId);

    await service.remove()

    res.status(200).json({
        success: true
    })
})

exports.getAllServices = Bigpromise(async (req, res, next) => {
    const services = await Service.find()
    res.status(200).json({
        success: true,
        services,
    })
})

exports.getServiceById = Bigpromise(async (req, res, next) => {
    const service = await Service.findById(req.params.id)

    if (service === null) {
        return next(new CustomError("No service found", 400));
    }
    res.status(200).json({
        success: true,
        service,
    })
})

exports.updateService = Bigpromise(async (req, res, next) => {
    const serviceId = req.params.id;
    const newData = {
        name: req.body.name,
        description: req.body.description
    }
    let service = await Service.findById(serviceId)

    if (service === null) {
        return next(new CustomError("No service found", 400));
    }
    
    if (req.files) {

        const imageId = service.image.id;

        const resp = await cloudinary.v2.uploader.destroy(imageId);
        let file = req.files.image
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "services",
        });

        newData.image = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }


    service = await Service.findOneAndUpdate(
        { _id: serviceId }, // Find the document to update by ID
        { $set: newData }, // Update the fields specified in newData
        { new: true, useFindAndModify: false } // Return the updated document
      );

      
    res.status(200).json({
        success: true,
        service
    });
})