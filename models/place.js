const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name of the place.'],
        maxlength: [40, 'Name should be under 40 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a place description']
    },
    entry: {
        type: Boolean,
        required: [true, 'Please provide entry details.']
    },
    entry_cost: [
        {
            category: {
                type: String,
                required: true,
            },
            cost: {
                type: Number,
                required: true
            }
        }
    ],
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
        street: {
            type: String,
            required: [true, 'Please provide street name.']
        },
        landmark: {
            type: String
        },
        city: {
            type: String,
            required: [true, 'Please provide city name.']
        },
        state: {
            type: String,
            required: [true, 'Please provide state name.']
        },
        zip: {
            type: String,
            required: [true, 'Please provide zip code.']
        },
        country: {
            type: String,
            required: [true, 'Please provide country name.']
        }
    },
    island: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Island',
        required: true
    },
    activities: {
        type: [String],
        required: false,
    },
    categories: {

        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Category',
        required: true
    },
    images: [
        {
            id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    external_links: [
        {
            title: {
                type: String,
                required: true
            },
            link: {
                type: String,
                required: true
            }
        }
    ],
    timings: [
        {
            day: {
                type: String,
                enum: [
                    "Monday", 
                    "Tuesday", 
                    "Wednesday", 
                    "Thursday", 
                    "Friday", 
                    "Saturday", 
                    "Sunday"
                ],
                required: true
            },
            open_time: {
                type: String,
                required: true
            },
            close_time: {
                type: String,
                required: true
            }
        }
    ],
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
            }
        }
    ]
})

module.exports = mongoose.model('Place', placeSchema)