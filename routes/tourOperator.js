const express = require('express')
const router = express.Router()

const { 
    addTourOperator, 
    getAllTourOperators, 
    getTourOperatorById,
    deleteTourOperatorById,
    updateTourOperator,
    approveTourOperator,
    getUnapprovedTourOperators,
    getTourOperatorsPerServiceProvider,
    getAllTourOperatorsForAdmin,
    unapproveTourOperator

} = require('../controllers/tourOperatorController');

const { isLoggedIn, customRole } = require('../middlewares/user');

// for both serviceprovider and admin
router.route('/touroperator/:id')
    .get( getTourOperatorById)
    .delete(isLoggedIn, customRole('serviceprovider', 'admin'), deleteTourOperatorById)
    .put(isLoggedIn, customRole('serviceprovider', 'admin'), updateTourOperator)
    
// only for serviceproviders
router.route('/touroperator/add').post(isLoggedIn, customRole('serviceprovider'), addTourOperator);
router.route('/serviceprovider/touroperators')
    .get(isLoggedIn, customRole('serviceprovider'), getTourOperatorsPerServiceProvider)

//for tourists
router.route('/touropertor/all').get(getAllTourOperators);

// only for admin
router.route('/admin/touropertor/all').get(isLoggedIn, customRole('admin'), getAllTourOperatorsForAdmin);
router.route('/admin/touroperator/approve/:id').put(isLoggedIn, customRole('admin'), approveTourOperator);
router.route('/admin/touroperator/unapprove/:id').put(isLoggedIn, customRole('admin'), unapproveTourOperator);
router.route('/admin/touroperator/unapproved').get(isLoggedIn, customRole('admin'), getUnapprovedTourOperators);


module.exports = router
