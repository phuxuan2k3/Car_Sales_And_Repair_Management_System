const express = require('express');
const router = express.Router();
const guestController = require('../controllers/siteRoleControllers/guestController')

router.get('/dashboard',guestController.getDashboard)
router.get('/cardetail', guestController.getCarDetail)



module.exports = router;