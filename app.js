const express = require('express');
const app = express();
require('dotenv').config();
const ENV = process.env;
const path = require('path');
const configEV = require('./config/configEV')
const configStaticResource = require('./config/configStaticResource')
const configSession = require('./config/configSession');
const { NotFound, HandleError } = require('./middlewares/ErrorHandling');


// Config
app.use(express.urlencoded({ extended: true }));
configEV(app, path.join(__dirname, 'views'));
configStaticResource(app, path.join(__dirname, 'public'))
configSession(app);

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

server.listen(3000);