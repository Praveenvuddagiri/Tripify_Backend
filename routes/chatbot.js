const express = require('express');
const router  = express.Router()
const app = express();
const {askQuestion} = require('../controllers/chatBotController');


router.route("/chatbot/ask").get(askQuestion);

module.exports = router;