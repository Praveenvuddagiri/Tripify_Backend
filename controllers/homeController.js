
const BigPromise = require('../middlewares/bigPromise')

exports.home = BigPromise(async(req, res) => {
    //const db = await something 
    
    res.status(200).json({
        success: true,
        greeting: "Welcome to Tripify",
    })
})