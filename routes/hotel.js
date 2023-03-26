const express = require('express');
const router  = express.Router()
const app = express();
const { 
    addHotel, 
    getHotelsPerServiceProvider,
    getHotelById,
    deleteHotelById,
    updateHotel,
    getAllHotels,
    getAllHotelsForAdmin,
    approveHotel,
    unapproveHotel,
    getUnapprovedHotels,
    getNearbyHotels
} = require('../controllers/hotelController');

const { isLoggedIn, customRole } = require('../middlewares/user');


// for both serviceprovider and admin
router.route('/hotel/:id')
    .get( getHotelById)
    .delete(isLoggedIn, customRole('serviceprovider', 'admin'), deleteHotelById)
    .put(isLoggedIn, customRole('serviceprovider', 'admin'), updateHotel)
    
// only for serviceproviders
router.route('/hotel/add').post(isLoggedIn, customRole('serviceprovider'), addHotel);
router.route('/serviceprovider/hotels')
    .get(isLoggedIn, customRole('serviceprovider'), getHotelsPerServiceProvider)

//for tourists
router.route('/hotel/all').get(getAllHotels);
router.route('/hotel/nearby').get(getNearbyHotels);

// only for admin
router.route('/admin/hotel/all').get(isLoggedIn, customRole('admin'), getAllHotelsForAdmin);
router.route('/admin/hotel/approve/:id').put(isLoggedIn, customRole('admin'), approveHotel);
router.route('/admin/hotel/unapprove/:id').put(isLoggedIn, customRole('admin'), unapproveHotel);
router.route('/admin/hotel/unapproved').get(isLoggedIn, customRole('admin'), getUnapprovedHotels);


module.exports = router;