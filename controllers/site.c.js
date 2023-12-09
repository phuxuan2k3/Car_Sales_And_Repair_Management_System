const tryCatch = require('../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;

module.exports = {
    getIndex: tryCatch(async (req, res) => {
        res.render('index', { title: 'Home Page' });
    }),
    getLoginPage: tryCatch(async (req, res) => {
        res.render('loginSignUp', { title: 'Login & Sign Up', jsFile: 'loginSignUp.js', cssFile: 'loginSignUp.css' });
    }),
    getRegisterPage: tryCatch(async (req, res) => {
        res.render('loginSignUp', { title: 'Login & Sign Up', isRegister: true, jsFile: 'loginSignUp.js', cssFile: 'loginSignUp.css' });
    }),
    getGuestDashboard: tryCatch(async (req, res) => {
        res.render('guestDashboard', { title: 'Dash Board' });
    })
}