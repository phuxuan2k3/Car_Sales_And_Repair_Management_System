const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api.c');
const { router: invoiceApiRouter } = require('./api/invoice.api.r');

//Handle login here
//Car
router.get('/car/all', ApiController.getAllCar);
router.get('/car/type', ApiController.getAllType);
router.get('/car/brand', ApiController.getAllBrand);
router.get('/car/car_page', ApiController.getCarPage);

// Invoices
router.use('/invoice', invoiceApiRouter);

module.exports = router;