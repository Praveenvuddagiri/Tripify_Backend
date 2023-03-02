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
    deleteReview
} = require('../controllers/placeController');

const { isLoggedIn, customRole } = require('../middlewares/user');

//to all users
router.route('/place/all').get(isLoggedIn, getAllPlaces);
router.route('/place/:id').get(isLoggedIn, getPlaceById);
router.route('/review').put(isLoggedIn, addReview);
router.route('/review').delete(isLoggedIn, deleteReview);
router.route('/reviews').get(isLoggedIn, getOnlyReviewsForOnePlace);


//admin
router.route('/admin/place/:id')
    .delete(isLoggedIn, customRole("admin"), adminDeletePlaceById)
    .put(isLoggedIn, customRole("admin"), adminUpdatePlace)
router.route('/admin/place/add').post(isLoggedIn, customRole('admin'), addPlace);

module.exports = router
