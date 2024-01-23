const express = require('express');
const router = express.Router();
const saleController = require('../../controllers/siteRoleControllers/saleController');


router.get('/dashboard', saleController.getDashboard);


module.exports = router;