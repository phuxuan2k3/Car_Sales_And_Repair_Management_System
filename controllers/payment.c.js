const tryCatch = require('../utils/tryCatch');
const Transaction = require('../models/paymentTransaction');
const PaymentAccount = require('../models/paymentAccount');

module.exports = {
    getAllTransaction: tryCatch(async (req, res) => {
        const data = await Transaction.GetAllTransaction();
        res.json(data)
    }),
    createNewAccount: tryCatch(async (req, res) => {
        try {
            const entity = req.body;
            const check = await PaymentAccount.GetAccountById(entity.id);
            if (check == null) {
                await PaymentAccount.AddNewAccount(entity);
                return res.send("Your account has been created");
            } else {
                return res.status(400).send("Account already exists");
            }
        } catch (error) {
            return res.status(500).send("An error occurred while creating the account");
        }
    }),
    createTransaction: tryCatch(async (req, res) => {
        try {
            const { from, to, amount, content } = req.body;
            const fromUser = await PaymentAccount.GetAccountById(from);
            const toUser = await PaymentAccount.GetAccountById(to);
            if (!fromUser || !toUser) {
                return res.status(400).send('Users must exist for a transaction');
            }
            console.log(fromUser.balance)
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
            return res.status(200).send({ from: from, to: to });
        } catch (error) {
            return res.status(500).send("An error occurred while creating the account");
        }
    }),

    getAccountById: tryCatch(async (req,res) => {
        try {
            const id = req.query.id;
            const account = await PaymentAccount.GetAccountById(id);
            if (account == null) {
                return res.status(400).send("Account not exists");
            } else {
                res.json(account);
            }
        } catch (error) {
            return res.status(500).send("An error occurred while getting the account");
        }
    })
}