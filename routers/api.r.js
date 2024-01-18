const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api.c');

//Handle login here
//Car
router.get('/car/all', ApiController.getAllCar);
router.get('/car/type', ApiController.getAllType);
router.get('/car/brand', ApiController.getAllBrand);
router.get('/car/car_page', ApiController.getCarPage);

//AutoPart
router.get('/ap/all',ApiController.getAllAp);
router.get('/ap/supplier',ApiController.getAllSupplier);
router.get('/ap/detail',ApiController.getAp);
router.get('/ap/ap_page',ApiController.getApPage);

//Fixed car
router.get('/car/fixed/all',ApiController.getAllFixedCar);
router.get('/car/fixed/find', ApiController.getFixedCarByCusId);

//User
router.get('/user/:id', ApiController.getUserById);

module.exports = router;