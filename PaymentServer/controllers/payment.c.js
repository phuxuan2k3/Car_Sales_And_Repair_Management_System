const tryCatch = require('../utils/tryCatch');
const Transaction = require('../models/paymentTransaction');
const PaymentAccount = require('../models/paymentAccount');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {

    deposit: tryCatch(async (req,res) => {
        try {
            var decoded = jwt.verify(req.body.token, process.env.SECRET_KEY);
            const { id, money } = decoded;
            const account = await PaymentAccount.GetAccountById(id);
            account.balance += money;
            await PaymentAccount.UpdateBalance(account.id, account.balance);
            const rsToken = jwt.sign('success', process.env.VERIFY_KEY);
            return res.json(rsToken);
        } catch (error) {
            return res.status(500).send("An error occurred while creating the account");
        };
    }),

    createNewAccount: tryCatch(async (req, res) => {
        try {
            const {token} = req.body;
            const entity = jwt.verify(token,process.env.SECRET_KEY);
            delete entity.iat;
            const check = await PaymentAccount.GetAccountById(entity.id);
            if (check == null) {
                await PaymentAccount.AddNewAccount(entity);
                return res.json(jwt.sign('success',process.env.VERIFY_KEY));
            } else {
                return res.status(400).send("Account already exists");
            }
        } catch (error) {
            return res.status(500).send("An error occurred while creating the account");
        }
    }),
    createTransaction: tryCatch(async (req, res) => {
        try {
            var decoded = jwt.verify(req.body.token, process.env.SECRET_KEY);
            const { from, to, amount, content } = decoded;
            const fromUser = await PaymentAccount.GetAccountById(from);
            const toUser = await PaymentAccount.GetAccountById(to);
            if (!fromUser || !toUser) {
                return res.status(400).send('Users must exist for a transaction');
            }
            if (fromUser.balance < amount) {
                return res.status(400).send('Insufficient balance');
            }
            fromUser.balance -= amount;
            toUser.balance += amount;
            const date = new Date();
            const timestampWithTimeZone = date.toISOString();
            const transaction = {
                from_id: from,
                to_id: to,
                amount: amount,
                date: timestampWithTimeZone,
                content: content
            }
            await PaymentAccount.UpdateBalance(fromUser.id, fromUser.balance);
            await PaymentAccount.UpdateBalance(toUser.id, toUser.balance);
            await Transaction.AddNewTransaction(transaction);
            const rsToken = jwt.sign('success', process.env.VERIFY_KEY);
            return res.json(rsToken);
        } catch (error) {
            return res.status(500).send("An error occurred while creating an transaction");
        }
    }),
    getAccountById: tryCatch(async (req, res) => {
        try {
            var decoded = jwt.verify(req.body.token, process.env.SECRET_KEY);
            const id = decoded.id;
            const account = await PaymentAccount.GetAccountById(id);
            if (account == null) {
                return res.status(400).send("Account not exists");
            } else {
                const rsToken = jwt.sign({ account }, process.env.VERIFY_KEY);
                res.json(rsToken);
            }
        } catch (error) {
            return res.status(500).send("An error occurred while getting the account");
        }
    }),
    getPaymentHistory: tryCatch(async (req,res) => {
        try {
            var decoded = jwt.verify(req.body.token, process.env.SECRET_KEY);
            const id = decoded.id;
            const data = await Transaction.GetPaymentHistoryById(id);
            const rsToken = jwt.sign({ data }, process.env.VERIFY_KEY);
            res.json(rsToken);
        } catch (error) {
            return res.status(500).send("An error occurred while getting payment history");
        };
    })
}