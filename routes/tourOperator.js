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
    getTourOperatorsPerServiceProvider

} = require('../controllers/tourOperatorController');

const { isLoggedIn, customRole } = require('../middlewares/user');


router.route('/touroperator/add').post(isLoggedIn, customRole('serviceprovider'), addTourOperator);
router.route('/touroperator/:id')
    .get( getTourOperatorById)
    .delete(isLoggedIn, customRole(['serviceprovider', 'admin']), deleteTourOperatorById)
    .put(isLoggedIn, customRole(['serviceprovider', 'admin']), updateTourOperator)
    

router.route('/serviceprovider/touroperators')
    .get(isLoggedIn, customRole('serviceprovider'), getTourOperatorsPerServiceProvider)

    
router.route('/touroperator/all').get(getAllTourOperators);
router.route('/touroperator/approve/:id').get(isLoggedIn, customRole('admin'), approveTourOperator);
router.route('/touroperator/unapproved').get(isLoggedIn, customRole('admin'), getUnapprovedTourOperators);


module.exports = router
