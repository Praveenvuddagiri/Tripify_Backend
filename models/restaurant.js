const mongoose = require('mongoose')
const validator = require('validator')

const restaurantSchema = new mongoose.Schema({
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
    isVeg: {
        type: Boolean,
        default: false,
        required: true,
    },
    images: [{
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number],
            required: [true, 'Please provide location coordinates.'],
        },
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        zip: { type: String, required: true }
    },
    contact: {
        phone: { type: String, required: true },
        email: {
            type: String,
            validate: [validator.isEmail, "Please enter a valid email."],
            unique: true,
            required: true
        },
        website: {
            type: String,
        }
    },
    island: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Island',
        required: true
    },
    menu: {
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

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);