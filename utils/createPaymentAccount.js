require('dotenv').config();
const ENV = process.env;
const url = `http://localhost:${ENV.PAYMENT_PORT}/create-payment-account`;


module.exports = async (id, balance) => {
    if (!balance) {
        balance = ENV.DEFAULT_BALANCE;
    }
    const data = { id, balance };
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
}