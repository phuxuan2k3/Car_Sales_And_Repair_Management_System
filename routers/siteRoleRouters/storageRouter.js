const express = require('express');
const router = express.Router();
const storageController = require('../../controllers/siteRoleControllers/storageController');
const upload = (require('../../config/configMulter'));


router.get('/dashboard', storageController.getDashboard);
router.get('/car', storageController.getCarPage);
router.get('/ap', storageController.getApPage);


router.get('/car/edit/:id', storageController.getEditCarPage);
router.post('/car/edit/:id', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'other-images', maxCount: 10 }]), storageController.editCar);

router.get('/car/insert', storageController.getInsertCarPage);
router.post('/car/insert', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'other-images', maxCount: 10 }]),
    storageController.insertCar);;

module.exports = router;