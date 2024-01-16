const express = require('express');
const router = express.Router();
const mechanicController = require('../../controllers/siteRoleControllers/mechanicController');

router.get('/dashboard', mechanicController.getDashboard);

module.exports = router;