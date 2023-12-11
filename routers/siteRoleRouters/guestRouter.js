const express = require('express');
const router = express.Router();
const guestController = require('../../controllers/siteRoleControllers/guestController');

router.get('/dashboard', guestController.getDashboard);

module.exports = router;