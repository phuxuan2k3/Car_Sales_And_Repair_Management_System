const express = require('express');
const router = express.Router();
const adminController = require('../controllers/siteRoleControllers/adminController')

// router.get('/dashboard', adminController.getDashboard)
router.get('/', adminController.getDashboard);


module.exports = router;