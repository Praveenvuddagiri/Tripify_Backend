const User = require('../models/user')

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');


exports.signup = Bigpromise(async (req,res,next) => {
     const {name, email, password} = req.body

     if(!email|| !password || !name){
          return next(new CustomError('Name, Email and Password are required fields.', 400));
     }

     const user = await User.create({
          name,
          email,
          password
     });

     cookieToken(user, res);
})

exports.login = Bigpromise(async (req,res,next) => {
     const {email, password} = req.body
     //check for presence of email and password

     if(!email || !password){
          return next(new CustomError("Please provide email and password.",400));
  
     }

     //get user from DB

     const user = await User.findOne({email}).select("+password")
     if(!user){
          return next(new CustomError("You are not registered to our database.",400));
     }

     const isPasswordCorrect = await user.isValidPassword(password)
     if(!isPasswordCorrect){
          return next(new CustomError("Email or password doesnot match or exist.",400));
     } 

     //send the token
     cookieToken(user,res);
})

exports.logout = Bigpromise(async (req,res,next) => {
     res.cookie('token', null,{
          expires: new Date(Date.now()),
          http: true,
     })
     res.status(200).json({
          success: true,
          message: "Logout Success",
     })
})

exports.forgotPassword = Bigpromise(async (req,res,next) => {
     const {email} = req.body;

     const user = await User.findOne({email});

     if(!user){
          return next(new CustomError("No such user found.", 500));
     }
     const forgotToken = user.getForgotPasswordToken();

     await user.save({validateBeforeSave: false});

     const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/form/${forgotToken}`

     const message =  `Copy paste this link in your URL and hit enter \n\n ${myUrl} \n \n Or  \n `
     
     const html = `<a href=${myUrl}>Click Here To Reset Password</a>`;
     try {
          await mailHelper({
               email: user.email,
               subject: "Tripify Andaman - Password reset email",
               message,
               html
          })

          res.status(200).json({
               success: true,
               message: "Email sent successfully"
          })
     } catch (error) {
          user.forgotPasswordExpiry = undefined;
          user.forgotPasswordToken = undefined;
          await user.save({validateBeforeSave: false});
          return next(new CustomError(error.message, 500));
     }
})

exports.ResetPasswordFormRender = Bigpromise(async (req,res,next) => {
     const token = req.params.token;

     res.render('forgotPasswordForm', {token});
     
})

exports.passwordReset = Bigpromise(async (req,res,next) => {
     const token = req.params.token;

     const encryToken = crypto
                         .createHash('sha256')
                         .update(token)
                         .digest('hex');

     const user = await User.findOne({
          forgotPasswordToken: encryToken,
          forgotPasswordExpiry: {$gt: Date.now()}
     })

     if(!user){
          return next(new CustomError("Token is invalid or expired!!", 400));
     }

     if(req.body.password !== req.body.confirmPassword){
          return next(new CustomError("Password and Confirm password doesnot match.", 400));
     }

     user.password = req.body.password

     user.forgotPasswordExpiry = undefined
     user.forgotPasswordToken = undefined
     await user.save()

     //send a JSON response 
     res.status(200).send("Password updated successfully, Go ahead and Login to our application.");
     // cookieToken(user,res); 
})

exports.getLoggedInUserDetails = Bigpromise(async (req,res,next) => {
     
     const user = await User.findById(req.user.id)

     res.status(200).json({
          success:true,
          user, 
     });
});

exports.changePassword = Bigpromise(async (req,res,next) => {
     
     const userId = req.user.id;

     const user = await User.findById(userId).select("+password");

     const isCorrectOldPassword = await user.isValidPassword(req.body.oldPassword)

     if(!isCorrectOldPassword){
          return next(new CustomError('old password is incorrect',400));
     }

     user.password = req.body.password;

     await user.save()

     cookieToken(user,res);

});

exports.updateUserDetails = Bigpromise(async (req,res,next) => {
     
     const userId = req.user.id;
     const newData = {
          name: req.body.name,
          email: req.body.email
     }

     const user = await User.findByIdAndUpdate(userId, newData,{
          new: true,
          runValidators: true,
          useFindAndModify: false,
     });

     res.status(200).json({
          success: true,
     });
});


exports.adminAllUser = Bigpromise(async (req,res,next) => {
   const users = await User.find({role: "user"})
   res.status(200).json({
     success: true,
     users,
   })
});


exports.adminAllServiceproviders = Bigpromise(async (req,res,next) => {
     const users = await User.find({role: "serviceprovider"})
     res.status(200).json({
       success: true,
       users,
     })
  });

  
exports.adminGetOneUser = Bigpromise(async (req,res,next) => {
     const user = await User.findById(req.params.id)

     if(user === null){
          next(new CustomError("No user found", 400));
     }
     res.status(200).json({
       success: true,
       user,
     })
  });

exports.adminUpdateOneUserDetails = Bigpromise(async (req,res,next) => {
     
     const userId = req.user.id;
     const newData = {
          name: req.body.name,
          email: req.body.email
     }

     const user = await User.findByIdAndUpdate(userId, newData,{
          new: true,
          runValidators: true,
          useFindAndModify: false,
     });

     res.status(200).json({
          success: true,
     });
});


exports.adminDeleteOneUser = Bigpromise(async (req,res,next) => {

     const user = await User.findById(req.params.id);

     if(user === null){
          next(new CustomError("No user found", 400));
     }

     await user.remove()

     res.status(200).json({
       success: true
     })
  });