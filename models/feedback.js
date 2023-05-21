const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Name of the person is required field."]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    email:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: [true,"Feedback is required field."]
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('Feedback', feedbackSchema);