require('dotenv').config();
const ENV = process.env;
const url = `http://localhost:${ENV.PAYMENT_PORT}/create-payment-account`;
const AppError = require('../utils/AppError');

module.exports = async (id, balance) => {
    if (!balance) {
        balance = ENV.DEFAULT_BALANCE;
    }
    const data = { id:id, balance };
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new AppError(response.status);
    }
}