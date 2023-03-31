const express = require('express');
const bigPromise = require('../middlewares/bigPromise');
const runPythonFunction = require('../utils/pythonRunFile');

const app = express();
const port = 3000;

exports.askQuestion = bigPromise(async (req, res, next) => {
    const param = req.query.question;
    const result = await runPythonFunction('chatbot/chat.py', 'my_function', param);
    res.status(200).json({
        success: true,
        result
    });
});
