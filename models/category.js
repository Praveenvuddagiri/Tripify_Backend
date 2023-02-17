const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        maxlength: [40, 'Name should be under 40 characters'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a category description']
    },
    image: {
        id:{
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Category', categorySchema);