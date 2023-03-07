const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Name of the service is required field."]
    },
    description: {
        type: String,
        required: [true,"Description of the service is required field."]
    },
    image: {
        id:{
            type: String,
            required:true,
        },
        secure_url: {
            type: String,
            required:true
        }
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('Service', serviceSchema);