const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api.c');
const registerUser = require('../middlewares/register');
const CarImport = require('../controllers/invoice/carimport.c');
const ApImport = require('../controllers/invoice/apimport.c');
const SaleRecord = require('../controllers/invoice/salerecord.c');
const FixRecord = require('../controllers/invoice/fixrecord.c');
const authentication = require('../middlewares/authentication');
const authorization = require('../middlewares/authorization');

//Handle login here
router.use(authentication);

//Car
router.get('/car/all', authorization(['cus']), ApiController.getAllCar);
router.get('/car/count', authorization(['cus']), ApiController.countCar);
router.get('/car/find', authorization(['cus']), ApiController.getByCarId);
router.get('/car/name', authorization(['cus']), ApiController.getCarByName);
router.get('/car/type', authorization(['cus']), ApiController.getAllType);
router.get('/car/brand', authorization(['cus']), ApiController.getAllBrand);
router.get('/car/car_page', authorization(['cus']), ApiController.getCarPage);
router.get('/car/most_car', authorization(['cus']), ApiController.getMostCar);
router.post('/car/update_quantity', authorization(['cus']), ApiController.updateCarQuantity);
router.get('/car/imgs/:id', authorization(['cus']), ApiController.getCarImgs);

router.delete('/car', authorization(['sm']), ApiController.deleteCar);

//AutoPart
router.get('/ap/all', authorization(['sm']), ApiController.getAllAp);
router.get('/ap/supplier', authorization(['sm']), ApiController.getAllSupplier);
router.get('/ap/detail', authorization(['sm']), ApiController.getAp);
router.get('/ap/ap_page', authorization(['sm']), ApiController.getApPage);
router.get('/ap/most_ap', authorization(['sm']), ApiController.getMostAp);
router.delete('/ap', authorization(['sm']), ApiController.deleteAp);
router.post('/ap/update-quantity', authorization(['sm']), ApiController.updateAutoPartQuantity)

//Fixed car
router.get('/car/fixed/all', authorization(['cus']), ApiController.getAllFixedCar);
router.get('/car/fixed/find', authorization(['cus']), ApiController.getFixedCarByCusIdAndSearch);
router.post('/car/fixed/add', authorization(['cus']), ApiController.addNewFixedCar);

//User
router.post('/user/register', registerUser);

router.get('/user/:id', authorization(['sm', 'ad']), ApiController.getUserById);
router.get('/countCus', authorization(['ad']), ApiController.getNumberOfCus);
router.get('/countEm', authorization(['ad']), ApiController.getNumberOfEmployee);

//For store
router.get('/store/items', authorization(['sm']), ApiController.getRemainingItems);

// Invoices
// router.use('/invoice', invoiceApiRouter);

// Admin
router.get('/admin/all', authorization(['ad']), ApiController.getAllUsers);
router.get('/admin/custom', authorization(['ad']), ApiController.getUsersByUsernameSearchByPermissionByPage);
router.get('/admin/count-custom', authorization(['ad']), ApiController.getUsersCountByUsernameSearchByPermission);
router.get('/admin/single', authorization(['ad']), ApiController.getUserById);
router.post('/admin/insert', authorization(['ad']), ApiController.insertUser);
router.post('/admin/update', authorization(['ad']), ApiController.updateUser);
router.post('/admin/delete', authorization(['ad']), ApiController.deleteUser);
router.post('/admin/check-username', authorization(['ad']), ApiController.checkUsernameExists)

// car sale record
router.get('/csale/all', authorization(['cus']), SaleRecord.getAllSaleRecords);
router.get('/csale/info', authorization(['cus']), SaleRecord.getFullSaleRecord);
router.get('/csale/customer', authorization(['cus']), SaleRecord.getSaleRecordsByCusId);
router.post('/csale/add-cart', authorization(['cus']), SaleRecord.addSaleRecordAndDetails);

// car fix record
router.get('/cfix/all', authorization(['cus']), FixRecord.getAllFixRecords);
router.get('/cfix/info', authorization(['cus']), FixRecord.getFullFixRecord);
router.get('/cfix/car-plate', authorization(['cus']), FixRecord.getSaleRecordsByPlate);
router.post('/cfix/add', authorization(['cus']), FixRecord.addFixRecord);
router.post('/cfix/add-detail', authorization(['mec']), FixRecord.addFixDetailToRecord);
router.post('/cfix/update-status-detail', authorization(['mec']), FixRecord.updateStatusOfFixDetail);
router.post('/cfix/update-detail-detail', authorization(['mec']), FixRecord.updateDetailOfFixDetail);
router.post('/cfix/update-status', authorization(['mec']), FixRecord.updateStatusOfFixRecord);
router.post('/cfix/update-pay', authorization(['cus']), FixRecord.updatePayOfFixRecord);

// car import invoice
router.get('/imcar/all', authorization(['sm']), CarImport.getAllInvoices);
router.get('/imcar/reports', authorization(['sm']), CarImport.getCarReportsOfInvoice);
router.get('/imcar/sm', authorization(['sm']), CarImport.getInvoicesByStoreManager);
router.post('/imcar/add-invoice', authorization(['sm']), CarImport.addCarInvoice);
router.post('/imcar/update-invoice', authorization(['sm']), CarImport.updateCarInvoice);
router.post('/imcar/delete-invoice', authorization(['sm']), CarImport.deleteCarInvoice);
router.post('/imcar/add-report', authorization(['sm']), CarImport.addCarReportToInvoice);
router.post('/imcar/update-report', authorization(['sm']), CarImport.updateCarReport);
router.post('/imcar/delete-report', authorization(['sm']), CarImport.deleteCarReport);

// ap import invoice
router.get('/imap/all', authorization(['sm']), ApImport.getAllInvoices);
router.get('/imap/reports', authorization(['sm']), ApImport.getApReportsOfInvoice);
router.get('/imap/sm', authorization(['sm']), ApImport.getInvoicesByStoreManager);
router.post('/imap/add-invoice', authorization(['sm']), ApImport.addApInvoice);
router.post('/imap/update-invoice', authorization(['sm']), ApImport.updateApInvoice);
router.post('/imap/delete-invoice', authorization(['sm']), ApImport.deleteApInvoice);
router.post('/imap/add-report', authorization(['sm']), ApImport.addApReportToInvoice);
router.post('/imap/update-report', authorization(['sm']), ApImport.updateApReport);
router.post('/imap/delete-report', authorization(['sm']), ApImport.deleteApReport);

//Cart
router.get('/cart', authorization(['cus']), ApiController.getCartByCusID);
router.get('/cart/find', authorization(['cus']), ApiController.getCarInCart);
router.post('/cart/add', authorization(['cus']), ApiController.insertToCart);
router.post('/cart/delete', authorization(['cus']), ApiController.deleteCartItem);
router.post('/cart/update_quantity', authorization(['cus']), ApiController.updateCarQuanTityInCart);

//Payment 
router.get('/payment/account', authorization(['cus']), ApiController.getAccount)
router.post('/payment/transfer', authorization(['cus']), ApiController.transferMoney)
router.post('/payment/deposits', authorization(['cus']), ApiController.deposits)


//chart
router.get('/revenue', authorization(['sa']), ApiController.getRevenue);
router.get('/topcar', authorization(['sa']), ApiController.getTopCar);
router.get('/saleTotal', authorization(['sa']), ApiController.getSaleTotal);
router.get('/fixTotal', authorization(['sa']), ApiController.getFixTotal);

//Car type
router.get('/type/all', authorization(['cus', 'sm']), ApiController.getAllCarType);
//Car brand
router.get('/brand/all', authorization(['cus', 'sm']), ApiController.getAllBrand);

module.exports = router;