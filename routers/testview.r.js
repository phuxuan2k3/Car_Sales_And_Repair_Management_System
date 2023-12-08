const express = require('express');
const router = express.Router();

router.get('/loginSignup',async (req,res,next) => {
    try {
        res.render('LoginSignup');
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