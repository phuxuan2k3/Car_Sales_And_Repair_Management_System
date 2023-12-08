const { engine } = require('express-handlebars');

const configEV = (app,filePath) => {
    app.engine('hbs', engine({extname: ".hbs"}));
    app.set('view engine', 'hbs');
    app.set('views', filePath);
}

module.exports = configEV;