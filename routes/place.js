const express = require('express')
const router = express.Router()

const {
    addPlace,
    getAllPlaces,
    getPlaceById,
    adminDeletePlaceById
} = require('../controllers/placeController');

const { isLoggedIn, customRole } = require('../middlewares/user');


router.route('/place/all').get(isLoggedIn, getAllPlaces);
router.route('/place/:id').get(isLoggedIn, getPlaceById)


router.route('/admin/place/:id').delete(isLoggedIn, customRole("admin"), adminDeletePlaceById)
router.route('/admin/place/add').post(isLoggedIn, customRole('admin'), addPlace);
module.exports = router
