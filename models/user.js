const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto') 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'Name should be under 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide a email'],
        validate: [validator.isEmail, "Please enter a valid email."],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password should be atleast of 8 char'],
        select: false,
    },
    role:{
        type: String,
        default: "user",
    },
    wishlist:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Place',
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt:{
        type: Date,
        default: Date.now,
    },
})

//encrypt password before save
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) 
        return next()
    this.password = await bcrypt.hash(this.password, 10)
    
})

// validate the password with passed on user password
userSchema.methods.isValidPassword = async function(usersendPassword) {
    return await bcrypt.compare(usersendPassword, this.password)
}

//create and return jwt tocken
userSchema.methods.getJwtToken = function(){
    // console.log(process.env.JWT_EXPIRY);
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    })
}

//generate forgot password token
userSchema.methods.getForgotPasswordToken = function(){
   // generate a random string
   const forgotToken = crypto.randomBytes(20).toString('hex')

   //getting an hash - make sure to get a hash on backend
   this.forgotPasswordToken = crypto
                                .createHash('sha256')
                                .update(forgotToken)
                                .digest('hex')

   //time of token (Expiry)
   this.forgotPasswordExpiry = Date.now() + process.env.PASSWORD_EXPIRY_MIN * 60 * 1000;

   return forgotToken;
}

module.exports = mongoose.model('User', userSchema);