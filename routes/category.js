const express = require('express')
const router = express.Router()

const {
    addCategory, 
    deleteCategory,
    getAllCategory,
    getCategoryById,
    updateCategory
} = require('../controllers/categoryController');
const { isLoggedIn, customRole } = require('../middlewares/user');


router.route('/category/add').post(isLoggedIn, customRole('admin'), addCategory);
router.route('/category/all').get( getAllCategory);
router.route('/category/:id')
    .delete(isLoggedIn, customRole('admin'), deleteCategory)
    .get( getCategoryById)
    .put(isLoggedIn, customRole('admin'), updateCategory);



module.exports = router;