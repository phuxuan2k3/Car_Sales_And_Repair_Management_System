const express = require('express');
const app = express();
require('dotenv').config();
const ENV = process.env;
const path = require('path');
const configEV = require('./config/configEV')
const configStaticResource = require('./config/configStaticResource')
const { NotFound, HandleError } = require('./middlewares/ErrorHandling');
const session = require('./middlewares/session');


// Config
configEV(app, path.join(__dirname, 'views'));
configStaticResource(app, path.join(__dirname, 'public'))

app.use(express.urlencoded({ extended: true }));

//Session
app.use(session);

//No Caching
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    next();
});

//Router
app.use('/', require('./routers/site.r'));
app.use('/test', require('./routers/testview.r'))

//Handle error middleware
app.use(NotFound);
app.use(HandleError);

//Run server
app.listen(ENV.WEBPORT);