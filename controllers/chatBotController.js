
const bigPromise = require('../middlewares/bigPromise');
const { askChatBot, trainChatBot } = require('../utils/chatbot');


exports.askQuestion = bigPromise(async (req, res, next) => {
    const param = req.query.question;

    const answer = await askChatBot(param);

    res.status(200).json({
        success:true,
        answer
    })
    
});


exports.trainChatBotAdmin = bigPromise(async (req, res, next) => {

    trainChatBot();

    res.status(200).json({
        success:true,
        message: "Trained the bot successfully"
    })
    
});
