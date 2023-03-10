const express = require('express')
const router = express.Router()

const {
    addPlace,
    getAllPlaces,
    getPlaceById,
    adminDeletePlaceById,
    adminUpdatePlace,
    addReview,
    getOnlyReviewsForOnePlace,
    deleteReview,
    getReviewOnePersonOnePlace,
    getPlacesNearby
} = require('../controllers/placeController');

const { isLoggedIn, customRole } = require('../middlewares/user');

//to all users
router.route('/place/all').get( getAllPlaces);
router.route('/place/:id').get( getPlaceById);
router.route('/places/nearby').get( getPlacesNearby);
router.route('/review').put(isLoggedIn, addReview);
router.route('/review').delete(isLoggedIn, deleteReview);
router.route('/reviews').get( getOnlyReviewsForOnePlace);
router.route('/userreview').get(isLoggedIn, getReviewOnePersonOnePlace);


//admin
router.route('/admin/place/:id')
    .delete(isLoggedIn, customRole("admin"), adminDeletePlaceById)
    .put(isLoggedIn, customRole("admin"), adminUpdatePlace)
router.route('/admin/place/add').post(isLoggedIn, customRole('admin'), addPlace);

module.exports = router
