const express = require('express');


require('dotenv').config();

const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: true}))

//adding cors security
const cors = require('cors')
app.use(cors('*'));


// for view engine for only using forgot password
app.set('view engine', "ejs");

//swagger docs related
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//custom error middleware for easy front end
const productionError = require("./middlewares/productionError");



//morgan middleware
const Morgan = require('morgan');
app.use(Morgan('tiny'));

//import all the routes
const home = require('./routes/home')
const user = require('./routes/user');
const category = require('./routes/category');
const island = require('./routes/island');
const place = require('./routes/place');
const service = require('./routes/service');
const tourOperator = require('./routes/tourOperator');
const hotel = require('./routes/hotel');

//cookie access
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//files handling
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}))


//middleware routes

app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', category);
app.use('/api/v1', island);
app.use('/api/v1', place);
app.use('/api/v1', service);
app.use('/api/v1', tourOperator);
app.use('/api/v1', hotel);


//to handle production error
app.use(productionError);

module.exports = app
