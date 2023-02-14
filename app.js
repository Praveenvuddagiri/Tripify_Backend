const express = require('express');


require('dotenv').config();

const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: true}))

//adding cors security
const cors = require('cors')
app.use(cors({
    origin: '*'
}));


// for view engine for only using forgot password
app.set('view engine', "ejs");

//swagger docs related
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



//morgan middleware
const Morgan = require('morgan');
app.use(Morgan('tiny'));

//import all the routes
const home = require('./routes/home')
const user = require('./routes/user');
const morgan = require('morgan');

//cookie access
const cookieParser = require('cookie-parser');
app.use(cookieParser());


//middleware routes

app.use('/api/v1', home);
app.use('/api/v1', user);

module.exports = app
