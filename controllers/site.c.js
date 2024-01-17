const tryCatch = require('../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;

module.exports = {
    getIndex: tryCatch(async (req, res) => {
        res.redirect('/login');
    }),
    getLoginPage: tryCatch(async (req, res) => {
        const failureMessage = req.flash()['error'];
        res.render('loginSignUp', { title: 'Login & Sign Up', jsFile: 'loginSignUp.js', cssFile: 'loginSignUp.css', loginMsg: failureMessage });
    }),
    getRegisterPage: tryCatch(async (req, res) => {
        res.render('loginSignUp', { title: 'Login & Sign Up', isRegister: true, jsFile: 'loginSignUp.js', cssFile: 'loginSignUp.css' });
    })
}