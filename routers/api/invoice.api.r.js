const express = require('express');
const router = express.Router();

const CarImport = require('../../controllers/invoice/carimport.c');
const ApImport = require('../../controllers/invoice/apimport.c');
const SaleRecord = require('../../controllers/invoice/salerecord.c');
const FixRecord = require('../../controllers/invoice/fixrecord.c');

// Go to each function for input/output requirements and return

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




module.exports = { router };