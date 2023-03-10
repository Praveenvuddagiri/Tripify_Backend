const express = require('express')
const router = express.Router()

const {
    addIsland, 
    deleteIsland,
    getAllIsland,
    getIslandById,
    updateIsland
} = require('../controllers/islandController');
const { isLoggedIn, customRole } = require('../middlewares/user');


router.route('/island/add').post(isLoggedIn, customRole('admin'), addIsland);
router.route('/island/all').get(getAllIsland);
router.route('/island/:id')
    .delete(isLoggedIn, customRole('admin'), deleteIsland)
    .get(getIslandById)
    .put(isLoggedIn, customRole('admin'), updateIsland);



module.exports = router;