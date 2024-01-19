const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.c');

router.get('/transaction/all',PaymentController.getAllTransaction);
router.post('/transaction',PaymentController.createTransaction);
router.post('/create-payment-account',PaymentController.createNewAccount);

module.exports = router;