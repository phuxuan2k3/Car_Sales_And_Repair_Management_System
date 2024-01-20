const express = require('express');
const router = express.Router();

const CarImport = require('../../controllers/invoice/carimport.c');
const ApImport = require('../../controllers/invoice/apimport.c');
const SaleRecord = require('../../controllers/invoice/salerecord.c');
const FixRecord = require('../../controllers/invoice/fixrecord.c');

// Go to each function for input/output requirements and return

router.get('/imcar/all', CarImport.getAllInvoices);
router.get('/imcar/reports', CarImport.getCarReportsOfInvoice);
router.get('/imcar/sm', CarImport.getInvoicesByStoreManager);

router.get('/imap/all', ApImport.getAllInvoices);
router.get('/imap/reports', ApImport.getApReportsOfInvoice);
router.get('/imap/sm', CarImport.getInvoicesByStoreManager);




module.exports = { router };