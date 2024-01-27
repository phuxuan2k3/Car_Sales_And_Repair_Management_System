const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.c');

router.post('/account', PaymentController.getAccountById);
router.post('/deposit', PaymentController.deposit);
router.post('/transaction', PaymentController.createTransaction);
router.post('/create-payment-account', PaymentController.createNewAccount);
router.post('/get-payment-history', PaymentController.getPaymentHistory);

router.get('/test', (req, res) => {
    console.log('oke');
    res.send('oke')
})
module.exports = router;