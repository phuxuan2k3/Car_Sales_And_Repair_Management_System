const express = require('express');
const app = express();
require('dotenv').config();
const ENV = process.env;
const bodyParser = require('body-parser');

// Config
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Router
app.use(require('./routers/payment.r'))

//Run server
app.listen(ENV.PAYMENT_PORT);