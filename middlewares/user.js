const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const User = require('../models/user');
const jwt = require('jsonwebtoken')


exports.isLoggedIn = Bigpromise(async(req,res,next) => {
    const token = 
        req.Cookies.token || req.header("Authorization").replace('Bearer ', "");

    console.log(token+"Here is the token");
    if(!token){
        return next(new CustomError('Login first to access this page', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    next();
})