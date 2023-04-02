const express = require('express');
const router  = express.Router()
const app = express();
const {askQuestion, trainChatBotAdmin} = require('../controllers/chatBotController');
const { isLoggedIn, customRole } = require('../middlewares/user');

router.route("/chatbot/ask").get(askQuestion);
router.route("/admin/chatbot/train").get(isLoggedIn, customRole("admin"), trainChatBotAdmin);

module.exports = router;