const dbExecute = require('../utils/paymentDbExecute');
const tableName = 'transaction';


module.exports = class Transaction {
    constructor(obj) {
        this.id = obj.id;
        this.from_id = obj.from_id;
        this.to_id = obj.to_id;
        this.content = obj.content;
        this.amount = obj.amount;
        this.date = obj.date;
    }
    static async GetAllTransaction() {
        const data = await dbExecute.getAll(tableName);
        return data.map(e => {return new Transaction(e)});
    }
    static async GetTransactionById(id) {
        const data = await dbExecute.getById(id,tableName);
        return data != null ? new Transaction(data) : data;
    }
    static async AddNewTransaction(entity) {
        return await dbExecute.insert(entity,tableName);
    }
    static async GetPaymentHistoryById(id) {
        const query = `SELECT * FROM "${tableName}" where "from_id"=${id}`;
        const data = await dbExecute.customQuery(query);
        return data.map(e => {return new Transaction(e)});
    }

}
