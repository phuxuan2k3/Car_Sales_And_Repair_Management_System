const express = require('express');
const router = express.Router();
const storageController = require('../../controllers/siteRoleControllers/storageController');
const upload = (require('../../config/configMulter'));


router.get('/dashboard', storageController.getDashboard);
router.get('/car', storageController.getCarPage);
router.get('/ap', storageController.getApPage);

router.get('/brand/edit/:brand', storageController.getEditBrandPage);
router.get('/brand', storageController.getBrandPage);
router.post('/brand/edit/:brand', storageController.editBrand);
router.get('/brand/insert', storageController.getInsertBrandPage);
router.post('/brand/insert', storageController.insertBrand);
router.get('/brand/delete/:brand', storageController.deleteBrand);

router.get('/type/edit/:type', storageController.getEditTypePage);
router.get('/type', storageController.getTypePage);
router.post('/type/edit/:type', storageController.editType);
router.get('/type/insert', storageController.getInsertTypePage);
router.post('/type/insert', storageController.insertType);
router.get('/type/delete/:type', storageController.deleteType);


router.get('/car/edit/:id', storageController.getEditCarPage);
router.post('/car/edit/:id', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'other-images', maxCount: 10 }]), storageController.editCar);
router.get('/car/insert', storageController.getInsertCarPage);
router.post('/car/insert', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'other-images', maxCount: 10 }]),
    storageController.insertCar);

router.get('/ap/edit/:id', storageController.getEditApPage);
router.post('/ap/edit/:id', storageController.editAp);
router.get('/ap/insert', storageController.getInsertApPage);
router.post('/ap/insert', storageController.insertAp);


module.exports = router;