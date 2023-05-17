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
    getPlacesNearby,
    getRecomendedPlacesToPlace,
    trainRecomendedPlacesToPlace,
    getRecomendedPlacesToUserCollaborative,
    getAllPlacesAdmin,
    getItineraryPlaces,
} = require('../controllers/placeController');

const { isLoggedIn, customRole } = require('../middlewares/user');

//to all users
router.route('/place/all').get( getAllPlaces);
router.route('/place/:id').get( getPlaceById);
router.route('/places/nearby').post( getPlacesNearby);
router.route('/place/similarContent/:id').get(getRecomendedPlacesToPlace);
router.route('/place/itinerary').post(getItineraryPlaces);
router.route('/user/recomendPlaces').get(isLoggedIn, getRecomendedPlacesToUserCollaborative);
router.route('/review').put(isLoggedIn, addReview);
router.route('/review').delete(isLoggedIn, deleteReview);
router.route('/reviews').get( getOnlyReviewsForOnePlace);
router.route('/userreview').get(isLoggedIn, getReviewOnePersonOnePlace);


//admin
router.route('/admin/place/:id')
    .delete(isLoggedIn, customRole("admin"), adminDeletePlaceById)
    .put(isLoggedIn, customRole("admin"), adminUpdatePlace)
router.route('/admin/place/add').post(isLoggedIn, customRole('admin'), addPlace);
router.route('/admin/place/similarContent/train').get(isLoggedIn, customRole('admin'), trainRecomendedPlacesToPlace);
router.route('/admin/place/all').get(isLoggedIn, customRole('admin'), getAllPlacesAdmin);


module.exports = router
