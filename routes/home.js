const express = require('express');
const router  = express.Router()
const app = express();
const {home} = require('../controllers/homeController');


router.route("/").get(home);

module.exports = router;