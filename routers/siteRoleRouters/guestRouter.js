const express = require('express');
const router = express.Router();
const guestController = require('../../controllers/siteRoleControllers/guestController');

router.get('/dashboard', guestController.getDashboard);
router.get('/cardetail', guestController.getCarDetail)
router.get('/repairservice',guestController.getRepairService);
router.get('/repairservice/detail',guestController.getRepairDetail);
router.get('/cart',guestController.getCartPage);
router.get('/cart/detail',guestController.getRecordDetail);

module.exports = router;