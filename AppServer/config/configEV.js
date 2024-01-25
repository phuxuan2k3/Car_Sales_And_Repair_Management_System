const { engine } = require('express-handlebars');
const helpers = require('../utils/helpers');

const configEV = (app,filePath) => {
    app.engine('hbs', engine({extname: ".hbs", helpers: helpers}));
    app.set('view engine', 'hbs');
    app.set('views', filePath);
}

module.exports = configEV;