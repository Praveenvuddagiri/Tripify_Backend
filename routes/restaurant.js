const express = require('express')
const router = express.Router()

const { 
    addRestaurant, 
    updateRestaurant, 
    deleteRestaurantById,
    getRestaurantsPerServiceProvider,
    getAllRestaurants,
    getAllRestaurantsForAdmin,
    approveRestaurant,
    unapproveRestaurant,
    getUnapprovedRestaurants,
    getRestaurantById,
    getNearbyRestaurants, 
    

} = require('../controllers/restaurantController');

const { isLoggedIn, customRole } = require('../middlewares/user');

// for both serviceprovider and admin
router.route('/restaurant/:id')
    .get(getRestaurantById)
    .delete(isLoggedIn, customRole('serviceprovider', 'admin'), deleteRestaurantById)
    .put(isLoggedIn, customRole('serviceprovider', 'admin'), updateRestaurant)
    
// only for serviceproviders
router.route('/restaurant/add').post(isLoggedIn, customRole('serviceprovider'), addRestaurant);
router.route('/serviceprovider/restaurants')
    .get(isLoggedIn, customRole('serviceprovider'), getRestaurantsPerServiceProvider)

// //for tourists
router.route('/restaurants/all').get(getAllRestaurants);
router.route('/restaurants/nearby').post(getNearbyRestaurants);

// // only for admin
router.route('/admin/restaurant/all').get(isLoggedIn, customRole('admin'), getAllRestaurantsForAdmin);
router.route('/admin/restaurant/approve/:id').put(isLoggedIn, customRole('admin'), approveRestaurant);
router.route('/admin/restaurant/unapprove/:id').put(isLoggedIn, customRole('admin'), unapproveRestaurant);
router.route('/admin/restaurant/unapproved').get(isLoggedIn, customRole('admin'), getUnapprovedRestaurants);


module.exports = router
