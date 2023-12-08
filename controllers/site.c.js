const tryCatch = require('../utils/tryCatch');

module.exports = {
    getIndex: tryCatch(async (req, res) => {
        res.render('index', { title: 'Home Page' });
    }),
    getLoginPage: tryCatch(async (req, res) => {
        res.render('login', { title: 'Login' });
    })
}