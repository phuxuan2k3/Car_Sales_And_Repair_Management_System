const express = require('express');
const app = express();
require('dotenv').config();
const ENV = process.env;
const bodyParser = require('body-parser');

// Config
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Router
app.use(require('./routers/payment.r'))

//Run server
app.listen(ENV.PAYMENT_PORT);