const Category = require('../models/category')

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');

exports.addCategory = Bigpromise(async (req, res, next) => {
    let result;
    if (req.files) {
        let file = req.files.image
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "categories",
        });
    }

    const { name, description } = req.body

    if (!name || !description) {
        return next(new CustomError('Name and description are required fields.', 400));
    }

    const category = await Category.create({
        name,
        description,
        image: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });

    res.status(200).json({
        success: true,
        category,
    })

})

exports.deleteCategory = Bigpromise(async (req, res, next) => {

    const category = await Category.findById(req.params.id);

    if (category === null) {
        return next(new CustomError("No category found", 401));
    }

    const imageId = category.image.id;

    await cloudinary.v2.uploader.destroy(imageId);

    await category.remove()

    res.status(200).json({
        success: true
    })
})

exports.getAllCategory = Bigpromise(async (req, res, next) => {
    const categories = await Category.find()
    res.status(200).json({
        success: true,
        categories,
    })
})

exports.getCategoryById = Bigpromise(async (req, res, next) => {
    const category = await Category.findById(req.params.id)

    if (category === null) {
        return next(new CustomError("No category found", 400));
    }
    res.status(200).json({
        success: true,
        category,
    })
})

exports.updateCategory = Bigpromise(async (req, res, next) => {
    const catId = req.params.id;
    const newData = {
        name: req.body.name,
        description: req.body.description
    }
    let category = await Category.findById(catId)

    if (category === null) {
        return next(new CustomError("No category found", 400));
    }
    
    if (req.files) {

        const imageId = category.image.id;

        const resp = await cloudinary.v2.uploader.destroy(imageId);
        let file = req.files.image
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "categories",
        });

        newData.image = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    // category = await Category.findByIdAndUpdate(catId, newData, {
    //     new: true,
    //     runValidators: true,
    //     useFindAndModify: false,
    // });

    category = await Category.findOneAndUpdate(
        { _id: catId }, // Find the document to update by ID
        { $set: newData }, // Update the fields specified in newData
        { new: true, useFindAndModify: false } // Return the updated document
      );

      
    res.status(200).json({
        success: true,
        category
    });
})