const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api.c');

//Handle login here
//Car
router.get('/car/all', ApiController.getAllCar);
router.get('/car/type', ApiController.getAllType);
router.get('/car/brand', ApiController.getAllBrand);
router.get('/car/car_page', ApiController.getCarPage);

//User
router.get('/user/:id', ApiController.getUserById);

module.exports = router;