const express = require('express');
const router = express.Router();

router.get('/login',async (req,res,next) => {
    try {
        res.render('LoginSignup',{isLogin: true});
    } catch (error) {
        next(error);
    };
    
})

router.get('/signup',async (req,res,next) => {
    try {
        res.render('LoginSignup',{isLogin: false});
    } catch (error) {
        next(error);
    };
    
})

router.get('/customer',async (req,res,next) => {
    try {
        res.render('customerPage');
    } catch (error) {
        next(error);
    };
    
})


module.exports = router;