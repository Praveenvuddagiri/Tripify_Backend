const express = require('express')
const router = express.Router()

const {
    signup,
    login,
    adminOrServiceProviderLogin,
    logout,
    forgotPassword,
    ResetPasswordFormRender,
    passwordReset,
    getLoggedInUserDetails,
    changePassword,
    updateUserDetails,
    adminAllUser,
    adminAllServiceproviders,
    adminGetOneUser,
    adminDeleteOneUser,
    userAddPlaceToWishlist,
    userRemovePlaceFromWishlist,
    regenerateOTP,
    verifyOtp
} = require('../controllers/userController');
const { isLoggedIn, customRole } = require('../middlewares/user');


router.route('/signup').post(signup);
router.route('/regenerate/otp').post(regenerateOTP);
router.route('/verify/otp').post(verifyOtp);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/form/:token').get(ResetPasswordFormRender);
router.route('/password/reset/:token').post(passwordReset);
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails);
router.route('/password/update').post(isLoggedIn, changePassword);
router.route('/userdashboard/update').put(isLoggedIn, updateUserDetails);

router.route('/admin/login').post(adminOrServiceProviderLogin);
router.route('/admin/users').get(isLoggedIn, customRole("admin"), adminAllUser);
router.route('/admin/serviceproviders').get(isLoggedIn, customRole("admin"), adminAllServiceproviders);
router.
    route('/admin/user/:id')
    .get(isLoggedIn, customRole("admin"), adminGetOneUser)
    .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser)


//wishlist
router.route('/wishlist/addplace').put(isLoggedIn, userAddPlaceToWishlist)
router.route('/wishlist/removeplace').delete(isLoggedIn, userRemovePlaceFromWishlist)
module.exports = router;