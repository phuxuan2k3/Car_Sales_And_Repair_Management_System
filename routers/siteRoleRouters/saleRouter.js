const express = require('express');
const router = express.Router();
const saleController = require('../../controllers/siteRoleControllers/saleController');

router.get('/dashboard', saleController.getDashboard);
router.get('/report', saleController.getReportPage);

router.get('/saleInvoices', saleController.getSaleInvoices);
router.get('/saleDetail', saleController.getSaleDetails);

router.get('/fixInvoices', saleController.getFixInvoices);
router.get('/fixDetail', saleController.getFixDetails);

router.get('/outputSaleInvoice', saleController.getSaleInvoicePdf);
router.get('/outputFixInvoice', saleController.getFixInvoicePdf);


module.exports = router;