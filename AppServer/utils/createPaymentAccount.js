require('dotenv').config();
const ENV = process.env;
const url = `https://localhost:${ENV.PAYMENT_PORT}/create-payment-account`;
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

module.exports = async (id, balance) => {
    if (!balance) {
        balance = ENV.DEFAULT_BALANCE;
    }
    const data = { id: id, balance };
    const sendData = {
        token: jwt.sign(data, ENV.SECRET_KEY)
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendData),
    });
    if (!response.ok) {
        throw new AppError(response.status);
    }
}