const express = require('express');
const router = express.Router();
const guestController = require('../controllers/siteRoleControllers/guestController')

router.get('/dashboard',guestController.getDashboard)
router.get('/cardetail', guestController.getCarDetail)
router.get('/repairservice',guestController.getRepairService);


module.exports = router;