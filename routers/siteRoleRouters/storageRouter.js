const express = require('express');
const router = express.Router();
const storageController = require('../../controllers/siteRoleControllers/storageController');

router.get('/dashboard', storageController.getDashboard);
router.get('/car', storageController.getCarPage);
router.get('/ap', storageController.getApPage);

module.exports = router;