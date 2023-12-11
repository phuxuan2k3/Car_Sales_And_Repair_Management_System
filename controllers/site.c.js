const { tryCatchMiddleware } = require('../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;

module.exports = {
    getIndex: tryCatchMiddleware(async (req, res) => {
        res.render('index', { title: 'Home Page' });
    }),
    getLoginPage: tryCatchMiddleware(async (req, res) => {
        res.render('loginSignUp', { title: 'Login & Sign Up', jsFile: 'loginSignUp.js', cssFile: 'loginSignUp.css' });
    }),
    getRegisterPage: tryCatchMiddleware(async (req, res) => {
        res.render('loginSignUp', { title: 'Login & Sign Up', isRegister: true, jsFile: 'loginSignUp.js', cssFile: 'loginSignUp.css' });
    })
}