const express = require('express');
const router = express.Router();

router.get('/login', async (req, res, next) => {
    try {
        res.render('LoginSignup', { isLogin: true ,jsFile: 'loginSignUp.js', cssFile: 'loginSignUp.css' });
    } catch (error) {
        next(error);
    };

})

router.get('/signup', async (req, res, next) => {
    try {
        res.render('LoginSignup', { isLogin: false,jsFile: 'loginSignUp.js', cssFile: 'loginSignUp.css' });
    } catch (error) {
        next(error);
    };

})

router.get('/customer', async (req, res, next) => {
    try {
        res.render('RoleView/guest/guestDashboard',{jsFile: 'guestDashboard.js'});
    } catch (error) {
        next(error);
    };

})

router.get('/cardetail', async (req, res, next) => {
    try {
        res.render('RoleView/guest/carDetail');
    } catch (error) {
        next(error);
    };
})

router.get('/mechanic', async (req, res, next) => {
    try {
        res.render('mechanicDashboard');
    } catch (error) {
        next(error);
    };
})


module.exports = router;