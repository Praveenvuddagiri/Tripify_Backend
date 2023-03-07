const express = require('express')
const router = express.Router()

const {
    addService, 
    getAllServices,
    deleteService,
    updateService,
    getServiceById,

} = require('../controllers/serviceController');
const { isLoggedIn, customRole } = require('../middlewares/user');

router.route('/service/add').post(isLoggedIn, customRole('admin'), addService);
router.route('/service/all').get(isLoggedIn, getAllServices);
router.route('/service/:id')
    .delete(isLoggedIn, customRole('admin'), deleteService)
    .get(isLoggedIn, getServiceById)
    .put(isLoggedIn, customRole('admin'), updateService);


module.exports = router;