const express = require('express');
const router = express.Router();
const storageController = require('../../controllers/siteRoleControllers/storageController');
const upload = require('../../config/configMulter');



router.get('/dashboard', storageController.getDashboard);
router.get('/car', storageController.getCarPage);
router.get('/ap', storageController.getApPage);


router.get('/car/edit/:id', storageController.getEditCarPage);
router.post('/car/edit/:id', upload.single('avatar'), storageController.editCar);

module.exports = router;