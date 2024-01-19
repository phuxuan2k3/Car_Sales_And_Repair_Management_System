const dbExecute = require('../utils/paymentDbExecute');
const tableName = 'account';


module.exports = class PaymentAccount {
    constructor(obj) {
        this.id = obj.id;
        this.balance = obj.balance;
    }
    static async GetAccountById(id) {
        const data = await dbExecute.getById(id,tableName);
        return data != null ? new PaymentAccount(data) : data;
    }
    static async AddNewAccount(entity) {
        return await dbExecute.insert(entity,tableName);
    }
    static async UpdateBalance(id,newBalance) {
        let entity = await this.GetAccountById(id);
        entity.balance = newBalance;
        return await dbExecute.update(id,entity,tableName);
    }
}


