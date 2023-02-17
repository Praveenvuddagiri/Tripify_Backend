const mongoose = require('mongoose')

const islandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a island name'],
        maxlength: [40, 'Name should be under 40 characters'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a island description']
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

module.exports = mongoose.model('Island', islandSchema);