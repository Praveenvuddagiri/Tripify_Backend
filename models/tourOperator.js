const mongoose = require('mongoose')
const validator = require('validator')

const tourOperatorsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a company name'],
        maxlength: [40, 'Name should be under 40 characters'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please provide some description about your company']
    },
    image: {
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        zip: { type: String, required: true }
    },
    contact: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: {
            type: String,
            validate: [validator.isEmail, "Please enter a valid email."],
            required: true
        },
        website: {
            type: String,
        }
    },
    tariffDocument: {
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    governmentAuthorizedLicense:{
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    serviceProvider:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('TourOperator', tourOperatorsSchema);