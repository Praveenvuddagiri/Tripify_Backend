const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const User = require('../models/user');
const jwt = require('jsonwebtoken')


exports.isLoggedIn = Bigpromise(async (req, res, next) => {

    const token =
        req.cookies.token || (req.header("Authorization") ? req.header("Authorization").replace('Bearer ', "") : null)

    if (!token) {
        return next(new CustomError('Login first to access this page', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    next();
})


exports.customRole = (...roles) => {
    return (req, res, next) => {
        console.log(roles);

        if (!roles.includes(req.user.role)) {
            return next(new CustomError("You are not allowed for this resource", 403))
        }
        next()
    }
}