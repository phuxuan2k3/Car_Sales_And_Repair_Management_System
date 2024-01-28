const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/api.c');
const registerUser = require('../middlewares/register');
const CarImport = require('../controllers/invoice/carimport.c');
const ApImport = require('../controllers/invoice/apimport.c');
const SaleRecord = require('../controllers/invoice/salerecord.c');
const FixRecord = require('../controllers/invoice/fixrecord.c');
const authApi = require('../middlewares/authApi');

//Car
router.get('/car/all', authApi(['cus', 'sm']), ApiController.getAllCar);
router.get('/car/count', authApi(['cus', 'sa', 'sm']), ApiController.countCar);
router.get('/car/find', authApi(['cus', 'sm']), ApiController.getByCarId);
router.get('/car/name', authApi(['cus', 'sm']), ApiController.getCarByName);
router.get('/car/type', authApi(['cus', 'sm']), ApiController.getAllType);
router.get('/car/brand', authApi(['cus', 'sm']), ApiController.getAllBrand);
router.get('/car/car_page', authApi(['cus', 'sm']), ApiController.getCarPage);
router.get('/car/most_car', authApi(['cus', 'sm']), ApiController.getMostCar);
router.post('/car/update_quantity', authApi(['cus', 'sm']), ApiController.updateCarQuantity);
router.get('/car/imgs/:id', authApi(['cus', 'sm']), ApiController.getCarImgs);

router.delete('/car', authApi(['sm']), ApiController.deleteCar);

//AutoPart
router.get('/ap/all', authApi(['sm', 'mec']), ApiController.getAllAp);
router.get('/ap/supplier', authApi(['sm']), ApiController.getAllSupplier);
router.get('/ap/detail', authApi(['sm', 'mec']), ApiController.getAp);
router.get('/ap/ap_page', authApi(['sm']), ApiController.getApPage);
router.get('/ap/most_ap', authApi(['sm']), ApiController.getMostAp);
router.delete('/ap', authApi(['sm']), ApiController.deleteAp);
router.post('/ap/update-quantity', authApi(['sm', 'mec']), ApiController.updateAutoPartQuantity)

//Fixed car
router.get('/car/fixed/all', authApi(['cus', 'mec']), ApiController.getAllFixedCar);
router.get('/car/fixed/find', authApi(['cus', 'mec']), ApiController.getFixedCarByCusIdAndSearch);
router.post('/car/fixed/add', authApi(['cus', 'mec']), ApiController.addNewFixedCar);

//User
router.post('/user/register', registerUser);

router.get('/user', authApi(['sm', 'ad', 'mec']), ApiController.getUserById);
router.get('/countCus', authApi(['sa', 'ad']), ApiController.getNumberOfCus);
router.get('/countEm', authApi(['sa', 'ad']), ApiController.getNumberOfEmployee);

//For store
router.get('/store/items', authApi(['sm']), ApiController.getRemainingItems);

// Invoices
// router.use('/invoice', invoiceApiRouter);

// Admin
router.get('/admin/all', authApi(['ad']), ApiController.getAllUsers);
router.get('/admin/custom', authApi(['ad']), ApiController.getUsersByUsernameSearchByPermissionByPage);
router.get('/admin/count-custom', authApi(['ad']), ApiController.getUsersCountByUsernameSearchByPermission);
router.get('/admin/single', authApi(['ad']), ApiController.getUserById);
router.post('/admin/insert', authApi(['ad']), ApiController.insertUser);
router.post('/admin/update', authApi(['ad']), ApiController.updateUser);
router.post('/admin/delete', authApi(['ad']), ApiController.deleteUser);
router.post('/admin/check-username', authApi(['ad']), ApiController.checkUsernameExists)

// car sale record
router.get('/csale/all', authApi(['cus', 'sm']), SaleRecord.getAllSaleRecords);
router.get('/csale/info', authApi(['cus']), SaleRecord.getFullSaleRecord);
router.get('/csale/customer', authApi(['cus']), SaleRecord.getSaleRecordsByCusId);
router.post('/csale/add-cart', authApi(['cus']), SaleRecord.addSaleRecordAndDetails);

// car fix record
router.get('/cfix/all', authApi(['cus', 'mec']), FixRecord.getAllFixRecords);
router.get('/cfix/info', authApi(['cus', 'mec']), FixRecord.getFullFixRecord);
router.get('/cfix/car-plate', authApi(['cus', 'mec']), FixRecord.getSaleRecordsByPlate);
router.post('/cfix/add', authApi(['cus', 'mec']), FixRecord.addFixRecord);
router.post('/cfix/add-detail', authApi(['mec']), FixRecord.addFixDetailToRecord);
router.post('/cfix/delete-detail', authApi(['mec']), FixRecord.deleteFixDetail);
router.post('/cfix/update-status-detail', authApi(['mec']), FixRecord.updateStatusOfFixDetail);
router.post('/cfix/update-detail-detail', authApi(['mec']), FixRecord.updateDetailOfFixDetail);
router.post('/cfix/update-status', authApi(['mec']), FixRecord.updateStatusOfFixRecord);
router.post('/cfix/update-pay', authApi(['cus']), FixRecord.updatePayOfFixRecord);

// car import invoice
router.get('/imcar/all', authApi(['sm']), CarImport.getAllInvoices);
router.get('/imcar/reports', authApi(['sm']), CarImport.getCarReportsOfInvoice);
router.get('/imcar/sm', authApi(['sm']), CarImport.getInvoicesByStoreManager);
router.post('/imcar/add-invoice', authApi(['sm']), CarImport.addCarInvoice);
router.post('/imcar/update-invoice', authApi(['sm']), CarImport.updateCarInvoice);
router.post('/imcar/delete-invoice', authApi(['sm']), CarImport.deleteCarInvoice);
router.post('/imcar/add-report', authApi(['sm']), CarImport.addCarReportToInvoice);
router.post('/imcar/update-report', authApi(['sm']), CarImport.updateCarReport);
router.post('/imcar/delete-report', authApi(['sm']), CarImport.deleteCarReport);

// ap import invoice
router.get('/imap/all', authApi(['sm']), ApImport.getAllInvoices);
router.get('/imap/reports', authApi(['sm']), ApImport.getApReportsOfInvoice);
router.get('/imap/sm', authApi(['sm']), ApImport.getInvoicesByStoreManager);
router.post('/imap/add-invoice', authApi(['sm']), ApImport.addApInvoice);
router.post('/imap/update-invoice', authApi(['sm']), ApImport.updateApInvoice);
router.post('/imap/delete-invoice', authApi(['sm']), ApImport.deleteApInvoice);
router.post('/imap/add-report', authApi(['sm']), ApImport.addApReportToInvoice);
router.post('/imap/update-report', authApi(['sm']), ApImport.updateApReport);
router.post('/imap/delete-report', authApi(['sm']), ApImport.deleteApReport);

//Cart
router.get('/cart', authApi(['cus']), ApiController.getCartByCusID);
router.get('/cart/find', authApi(['cus']), ApiController.getCarInCart);
router.post('/cart/add', authApi(['cus']), ApiController.insertToCart);
router.post('/cart/delete', authApi(['cus']), ApiController.deleteCartItem);
router.post('/cart/update_quantity', authApi(['cus']), ApiController.updateCarQuanTityInCart);

//Payment 
router.get('/payment/account', authApi(['cus']), ApiController.getAccount)
router.post('/payment/transfer', authApi(['cus']), ApiController.transferMoney)
router.post('/payment/deposits', authApi(['cus']), ApiController.deposits)
router.post('/payment/history', authApi(['cus']), ApiController.paymentHistory)


//chart
router.get('/revenue', authApi(['sa']), ApiController.getRevenue);
router.get('/topcar', authApi(['sa']), ApiController.getTopCar);
router.get('/saleTotal', authApi(['sa']), ApiController.getSaleTotal);
router.get('/fixTotal', authApi(['sa']), ApiController.getFixTotal);

//Car type
router.get('/type/all', authApi(['cus', 'sm']), ApiController.getAllCarType);
//Car brand
router.get('/brand/all', authApi(['cus', 'sm']), ApiController.getAllBrand);

module.exports = router;