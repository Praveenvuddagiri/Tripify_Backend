const nodemailer = require("nodemailer");

const mailHelper = async (options) => {
    let transporter = nodemailer.createTransport({
        service:"Gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    const message = {
        from: 'tripify.andaman@gmail.com', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
        html: options.html,
    };
    await transporter.sendMail(message);

}

module.exports = mailHelper;