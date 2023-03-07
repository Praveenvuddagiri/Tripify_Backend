const User = require('../models/user')

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');


exports.signup = Bigpromise(async (req, res, next) => {
     const { name, email, password, role } = req.body

     if (!email || !password || !name) {
          return next(new CustomError('Name, Email and Password are required fields.', 400));
     }

     if(!role){
          role = "user";
     }

     const user = await User.create({
          name,
          email,
          password,
          role
     });

     cookieToken(user, res);
})

exports.login = Bigpromise(async (req, res, next) => {
     const { email, password } = req.body
     //check for presence of email and password

     if (!email || !password) {
          return next(new CustomError("Please provide email and password.", 400));

     }

     //get user from DB

     const user = await User.findOne({ email }).select("+password")
     if (!user) {
          return next(new CustomError("You are not registered to our database.", 400));
     }

     const isPasswordCorrect = await user.isValidPassword(password)
     if (!isPasswordCorrect) {
          return next(new CustomError("Email or password doesnot match or exist.", 400));
     }

     //send the token
     cookieToken(user, res);
})


exports.adminOrServiceProviderLogin = Bigpromise(async (req, res, next) => {
     const { email, password } = req.body
     //check for presence of email and password

     if (!email || !password) {
          return next(new CustomError("Please provide email and password.", 400));

     }

     //get user from DB

     const user = await User.findOne({ email }).select("+password")
     if (!user) {
          return next(new CustomError("You are not registered to our database.", 400));
     }

     if(user.role === 'user'){
          return next(new CustomError("You are not allowed to access the admin or service provider dashboard.", 400));
     }

     const isPasswordCorrect = await user.isValidPassword(password)
     if (!isPasswordCorrect) {
          return next(new CustomError("Email or password doesnot match or exist.", 400));
     }

     //send the token
     cookieToken(user, res);
})

exports.logout = Bigpromise(async (req, res, next) => {
     res.cookie('token', null, {
          expires: new Date(Date.now()),
          http: true,
     })
     res.status(200).json({
          success: true,
          message: "Logout Success",
     })
})

exports.forgotPassword = Bigpromise(async (req, res, next) => {
     const { email } = req.body;

     const user = await User.findOne({ email });

     if (!user) {
          return next(new CustomError("No such user found.", 500));
     }
     const forgotToken = user.getForgotPasswordToken();

     await user.save({ validateBeforeSave: false });

     const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/form/${forgotToken}`

     const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl} \n \n Or  \n `

     const html = `<!DOCTYPE html>
     <html>
     <head>
          <title>Reset Your Tripify Password</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
               body {
                    background-color: #f7f7f7;
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333;
               }
               .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                    box-shadow: 0 0 10px rgba(0,0,0,0.2);
                    border-radius: 5px;
                    text-align: center;
               }
               h1 {
                    margin-top: 0;
                    font-size: 28px;
                    font-weight: bold;
                    color: #008CBA;
               }
               button {
                    background-color: #008CBA;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    margin-top: 20px;
                    display: inline-block;
                    transition: background-color 0.3s ease;
               }
               button:hover {
                    background-color: #0077A3;
               }
               p {
                    margin-top: 20px;
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333;
               }
               a {
                    color: #008CBA;
                    text-decoration: none;
                    word-wrap: break-word;
                    
               }
               a:hover {
                    text-decoration: underline;
               }

          </style>
     </head>
     <body>
          <div class="container">
               <h1>Reset Your Tripify Password</h1>
               <img style="width: 200px; height: auto;" src="https://res.cloudinary.com/diowg4rud/image/upload/v1677856928/WhatsApp_Image_2023-03-03_at_20.17.29-removebg-preview_neo00m.png"/>
               <p>Dear Valued User,</p>
               <p>We have received a request to reset your password for your Tripify account. If you did not initiate this request, please ignore this email.</p>

               <img style="width: 80%; height: auto;" src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/7631/password_reset.png"/> 
               <p>"Oops! Looks like you've forgotten your password, but don't worry, we've got you covered. Let's get you back into your account!"</p>
               <p>To reset your password, please click the following button:</p>
               <a href="${myUrl}"><button>Reset Password</button></a>
               <p>Alternatively, you can copy and paste the following link into your browser:</p>
               <p><a href="${myUrl}">${myUrl}</a></p>
               <p>Please note that this link will expire in 20 minutes for security purposes. If you have any questions or concerns, please contact our support team at <a href="mailto:support@tripify.com">tripify.andaman@gmail.com</a>.</p>
               <p>Thank you for choosing Tripify for your travel needs.</p>
               <p>Best regards,</p>
               <p>The Tripify Team</p>
          </div>
     </body>
     </html>
     `;
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
          await user.save({ validateBeforeSave: false });
          return next(new CustomError(error.message, 500));
     }
})

exports.ResetPasswordFormRender = Bigpromise(async (req, res, next) => {
     const token = req.params.token;

     res.render('forgotPasswordForm', { token });

})

exports.passwordReset = Bigpromise(async (req, res, next) => {
     const token = req.params.token;

     const encryToken = crypto
          .createHash('sha256')
          .update(token)
          .digest('hex');

     const user = await User.findOne({
          forgotPasswordToken: encryToken,
          forgotPasswordExpiry: { $gt: Date.now() }
     })

     if (!user) {
          return next(new CustomError("Token is invalid or expired!!", 400));
     }

     const password = req.body.password;
     const regex = /^(?=.*[A-Z])(?=.*\d{3})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

     if (!regex.test(password)) {
          return next(new CustomError("Password should have one UpperCase character, 3 numeric characters and one special character, please and try again.", 400));
     }

     if (req.body.password !== req.body.confirmPassword) {
          return next(new CustomError("Password and Confirm password doesnot match.", 400));
     }

     user.password = req.body.password

     user.forgotPasswordExpiry = undefined
     user.forgotPasswordToken = undefined
     await user.save()

     //send a JSON response 
     // res.status(200).send("Password updated successfully, Go ahead and Login to our application.");
     // cookieToken(user,res); 

     res.status(200).send(`
          <!DOCTYPE html>
          <html>
          <head>
               <title>Password updated successfully</title>
               <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
               <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
               <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
               <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
          </head>
          <body>
               <div class="container mt-5">
               <div class="alert alert-success alert-dismissible fade show" role="alert">
                    Password updated successfully. Go ahead and login to our application.
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
               </div>
               </div>
          </body>
          </html>
          `);

})

exports.getLoggedInUserDetails = Bigpromise(async (req, res, next) => {

     const user = await User.findById(req.user.id)

     res.status(200).json({
          success: true,
          user,
     });
});

exports.changePassword = Bigpromise(async (req, res, next) => {

     const userId = req.user.id;

     const user = await User.findById(userId).select("+password");

     const isCorrectOldPassword = await user.isValidPassword(req.body.oldPassword)

     if (!isCorrectOldPassword) {
          return next(new CustomError('old password is incorrect', 400));
     }

     user.password = req.body.password;

     await user.save()

     cookieToken(user, res);

});

exports.updateUserDetails = Bigpromise(async (req, res, next) => {

     const userId = req.user.id;
     const newData = {
          name: req.body.name,
          email: req.body.email
     }

     const user = await User.findByIdAndUpdate(userId, newData, {
          new: true,
          runValidators: true,
          useFindAndModify: false,
     });

     res.status(200).json({
          success: true,
     });
});


exports.adminAllUser = Bigpromise(async (req, res, next) => {
     const users = await User.find({ role: "user" })
     res.status(200).json({
          success: true,
          users,
     })
});


exports.adminAllServiceproviders = Bigpromise(async (req, res, next) => {
     const users = await User.find({ role: "serviceprovider" })
     res.status(200).json({
          success: true,
          users,
     })
});


exports.adminGetOneUser = Bigpromise(async (req, res, next) => {
     const user = await User.findById(req.params.id)

     if (user === null) {
          next(new CustomError("No user found", 400));
     }
     res.status(200).json({
          success: true,
          user,
     })
});

exports.adminUpdateOneUserDetails = Bigpromise(async (req, res, next) => {

     const userId = req.user.id;
     const newData = {
          name: req.body.name,
          email: req.body.email
     }

     const user = await User.findByIdAndUpdate(userId, newData, {
          new: true,
          runValidators: true,
          useFindAndModify: false,
     });

     res.status(200).json({
          success: true,
     });
});


exports.adminDeleteOneUser = Bigpromise(async (req, res, next) => {

     const user = await User.findById(req.params.id);

     if (user === null) {
          next(new CustomError("No user found", 400));
     }

     await user.remove()

     res.status(200).json({
          success: true
     })
});

//wishlist
exports.userAddPlaceToWishlist = Bigpromise(async (req, res, next) => {

     const user = req.user

     if (user.wishlist.includes(req.query.id)) {
          return next(new CustomError("Already added to the wishlist.", 401));
     }
     user.wishlist.push(req.query.id);
     await user.save({ validateBeforeSave: false });

     res.status(200).json({
          success: true,
          message: "Added place to wishlist."
     })
});

exports.userRemovePlaceFromWishlist = Bigpromise(async (req, res, next) => {

     const user = req.user

     user.wishlist.remove(req.query.id);

     await user.save({ validateBeforeSave: false });

     res.status(200).json({
          success: true,
          message: "Removed place from wishlist."
     })
});




