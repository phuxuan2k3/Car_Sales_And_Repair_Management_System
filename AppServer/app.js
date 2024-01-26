const express = require('express');
const app = express();
require('dotenv').config();
const ENV = process.env;
const path = require('path');
const configEV = require('./config/configEV')
const configStaticResource = require('./config/configStaticResource')
const configSession = require('./config/configSession');
const { NotFound, HandleError } = require('./middlewares/ErrorHandling');
const passport = require('./config/mainPassport');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sslServer = require('./config/configSSL');

// Config
app.use(express.urlencoded({ extended: true }));
configEV(app, path.join(__dirname, 'views'));
configStaticResource(app, path.join(__dirname, 'public'))
configSession(app);
app.use(bodyParser.json());
app.use(flash());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser("sgx"));

//No Caching
// app.use((req, res, next) => {
//     res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
//     next();
// });

app.use(passport.initialize());
app.use(passport.session());

//Router
app.use('/api', require('./routers/api.r'));

app.use('/', require('./routers/site.r'));

//Handle error middleware
app.use(NotFound);
app.use(HandleError);

const appSSL = sslServer(app);

appSSL.listen(ENV.WEBPORT);