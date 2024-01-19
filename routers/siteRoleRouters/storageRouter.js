const express = require('express');
const router = express.Router();
const storageController = require('../../controllers/siteRoleControllers/storageController');

router.get('/dashboard', storageController.getDashboard);

module.exports = router;