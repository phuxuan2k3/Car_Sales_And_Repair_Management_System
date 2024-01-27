require('dotenv').config();
const ENV = process.env;
const url = `https://localhost:${ENV.PAYMENT_PORT}/create-payment-account`;
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const https = require('https');

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
        agent: new https.Agent({
            rejectUnauthorized: false,
        })
    });
    if (!response.ok) {
        throw new AppError(response.status);
    }
}