const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api.c');
const { router: invoiceApiRouter } = require('./api/invoice.api.r');
const registerUser = require('../middlewares/register');
const CarImport = require('../controllers/invoice/carimport.c');
const ApImport = require('../controllers/invoice/apimport.c');
const SaleRecord = require('../controllers/invoice/salerecord.c');
const FixRecord = require('../controllers/invoice/fixrecord.c');

//Handle login here
//Car
router.get('/car/all', ApiController.getAllCar);
router.get('/car/find', ApiController.getByCarId);
router.get('/car/name', ApiController.getCarByName);
router.get('/car/type', ApiController.getAllType);
router.get('/car/brand', ApiController.getAllBrand);
router.get('/car/car_page', ApiController.getCarPage);
router.get('/car/most_car', ApiController.getMostCar);
router.post('/car/update_quantity', ApiController.updateCarQuantity);
router.get('/car/imgs/:id', ApiController.getCarImgs);
router.delete('/car', ApiController.deleteCar);

//AutoPart
router.get('/ap/all', ApiController.getAllAp);
router.get('/ap/supplier', ApiController.getAllSupplier);
router.get('/ap/detail', ApiController.getAp);
router.get('/ap/ap_page', ApiController.getApPage);
router.get('/ap/most_ap', ApiController.getMostAp);
router.delete('/ap', ApiController.deleteAp);

//Fixed car
router.get('/car/fixed/all', ApiController.getAllFixedCar);
router.get('/car/fixed/find', ApiController.getFixedCarByCusIdAndSearch);
router.post('/car/fixed/add', ApiController.addNewFixedCar);

//User
router.get('/user/:id', ApiController.getUserById);
router.post('/user/register', registerUser);

//For store
router.get('/store/items', ApiController.getRemainingItems);

// Invoices
router.use('/invoice', invoiceApiRouter);


// car sale record
router.get('/csale/all', SaleRecord.getAllSaleRecords);
router.get('/csale/info', SaleRecord.getFullSaleRecord);
router.get('/csale/customer', SaleRecord.getSaleRecordsByCusId);
router.post('/csale/add-cart', SaleRecord.addSaleRecordAndDetails);

// car fix record
router.get('/cfix/all', FixRecord.getAllFixRecords);
router.get('/cfix/info', FixRecord.getFullFixRecord);
router.get('/cfix/car-plate', FixRecord.getSaleRecordsByPlate);
router.post('/cfix/add', FixRecord.addFixRecord);
router.post('/cfix/add-detail', FixRecord.addFixDetailToRecord);
router.post('/cfix/update-status-detail', FixRecord.updateStatusOfFixDetail);
router.post('/cfix/update-detail-detail', FixRecord.updateDetailOfFixDetail);
router.post('/cfix/update-status', FixRecord.updateStatusOfFixRecord);
router.post('/cfix/update-pay', FixRecord.updatePayOfFixRecord);

// car import invoice
router.get('/imcar/all', CarImport.getAllInvoices);
router.get('/imcar/reports', CarImport.getCarReportsOfInvoice);
router.get('/imcar/sm', CarImport.getInvoicesByStoreManager);
router.post('/imcar/add-invoice', CarImport.addCarInvoice);
router.post('/imcar/update-invoice', CarImport.updateCarInvoice);
router.post('/imcar/delete-invoice', CarImport.deleteCarInvoice);
router.post('/imcar/add-report', CarImport.addCarReportToInvoice);
router.post('/imcar/update-report', CarImport.updateCarReport);
router.post('/imcar/delete-report', CarImport.deleteCarReport);

// ap import invoice
router.get('/imap/all', ApImport.getAllInvoices);
router.get('/imap/reports', ApImport.getApReportsOfInvoice);
router.get('/imap/sm', ApImport.getInvoicesByStoreManager);
router.post('/imap/add-invoice', ApImport.addApInvoice);
router.post('/imap/update-invoice', ApImport.updateApInvoice);
router.post('/imap/delete-invoice', ApImport.deleteApInvoice);
router.post('/imap/add-report', ApImport.addApReportToInvoice);
router.post('/imap/update-report', ApImport.updateApReport);
router.post('/imap/delete-report', ApImport.deleteApReport);

//Cart
router.get('/cart', ApiController.getCartByCusID);
router.get('/cart/find', ApiController.getCarInCart);
router.post('/cart/add', ApiController.insertToCart);
router.post('/cart/delete', ApiController.deleteCartItem);
router.post('/cart/update_quantity', ApiController.updateCarQuanTityInCart);

module.exports = router;