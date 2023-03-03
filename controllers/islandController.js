const Island = require('../models/island')

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const whereCaluse = require('../utils/whereClause');
const Place = require('../models/place');

exports.addIsland = Bigpromise(async (req, res, next) => {
    let result;
    if (req.files) {
        let file = req.files.image
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "islands",
        });
    }

    const { name, description } = req.body

    if (!name || !description) {
        return next(new CustomError('Name and description are required fields.', 400));
    }

    const island = await Island.create({
        name,
        description,
        image: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });

    res.status(200).json({
        success: true,
        island,
    })

})

exports.deleteIsland = Bigpromise(async (req, res, next) => {

    const island = await Island.findById(req.params.id);

    if (island === null) {
        next(new CustomError("No Island found", 401));
    }

    //check wheather the island is in use or not
    req.query.island = req.params.id;

    const placesObj = await new whereCaluse(Place.find(), req.query).filter();
    
    let places = await placesObj.base

    if(places.length!==0){
        return next(new CustomError("Island is used somewhere, cannot be deleted.", 401));
    }


    const imageId = island.image.id;

    await cloudinary.v2.uploader.destroy(imageId);

    await island.remove()

    res.status(200).json({
        success: true
    })
})

exports.getAllIsland = Bigpromise(async (req, res, next) => {
    const islands = await Island.find()
    res.status(200).json({
        success: true,
        islands,
    })
})

exports.getIslandById = Bigpromise(async (req, res, next) => {
    const island = await Island.findById(req.params.id)

    if (island === null) {
        next(new CustomError("No Island found", 400));
    }
    res.status(200).json({
        success: true,
        island,
    })
})

exports.updateIsland = Bigpromise(async (req, res, next) => {
    const islandId = req.params.id;
    const newData = {
        name: req.body.name,
        description: req.body.description,
    }
    let island = await Island.findById(islandId)

    if (island === null) {
        next(new CustomError("No Island found", 400));
    }

    if (req.files) {

        const imageId = island.image.id;

        const resp = await cloudinary.v2.uploader.destroy(imageId);
        let file = req.files.image
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "islands",
        });

        newData.image = {
            id: result.public_id,
            secure_url: result.secure_url
        }
        console.log(newData);
    }

    // island = await Island.findByIdAndUpdate(islandId, newData, {
    //     new: true,
    //     runValidators: true,
    //     useFindAndModify: false,
    // });

    island = await Island.findOneAndUpdate(
        { _id: islandId }, // Find the document to update by ID
        { $set: newData }, // Update the fields specified in newData
        { new: true, useFindAndModify: false } // Return the updated document
      );
      

    res.status(200).json({
        success: true,
        island
    });
})