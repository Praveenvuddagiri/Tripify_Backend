const mongoose = require('mongoose')
const validator = require('validator')

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a hotel name'],
        maxlength: [40, 'Name should be under 40 characters'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please provide some description about your hotel']
    },
    images: [
        {
            id: {
                type: String,
                required: true,
                unique:true,
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        zip: { type: String, required: true }
    },
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
    checkinTime: {
        type: String,
        required: true
    },
    checkoutTime: {
        type: String,
        required: true
    },
    island: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Island',
        required: true
    },
    rooms: [
        {
            roomType: {
                type: String,
                enum: {
                    values: [
                    "Single Room", 
                    "Twin Room", 
                    "Triple Room", 
                    "Family Room", 
                    "Suite Room",
                    "Deluxe Room",
                    "Cottage",
                    "Dormitory Room",
                    "Executive Suite"
                ],
                    message: "Selected room type not available.",
                },
                
            },
            description: String,
            price: Number,
            maxOccupancy: Number,
            beds: {
              bedType: {
                type: String,
                enum: {
                    values: [
                        "Single",
                        "Twin",
                        "Double",
                        "Queen",
                        "King",
                        "Super King",
                        "Bunk Bed",
                        "Sofa Bed",
                        "Futon",
                        "Trundle Bed",
                        "Murphy Bed",
                        "Day Bed"
                ],
                    message: "Selected bed type not available.",
                },
              },
              quantity: Number
            },
            amenities: [String]
        }
    ],
    facilities: [String],
    ratings: {
        type: Number,
        default: 0,
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required:true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            sentiment: {
                type: String,
                required:true
            }
        }
    ],
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

hotelSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Hotel', hotelSchema);