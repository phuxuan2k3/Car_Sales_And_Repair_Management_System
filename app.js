const express = require('express');
const app = express();
require('dotenv').config();
const ENV = process.env;
const expbs = require('express-handlebars');
const router = require('./routers/router');

const hbs = expbs.create({
    defaultLayout: 'main'
})

app.engine('handlebars', hbs.engine);
app.set('views', './views');
app.set('view engine', 'handlebars');

app.use(router)

app.listen(ENV.WEBPORT);