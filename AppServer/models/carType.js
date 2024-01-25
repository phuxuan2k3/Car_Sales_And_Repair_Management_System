const dbExecute = require('../utils/dbExecute');
const { pgp } = require('../config/configDatabase');
const queryHelper = pgp.helpers;
const tableName = 'car_type';

module.exports = class Type {
    constructor(obj) {
        this.type = obj.type;
    }
    static async getAll() {
        const data = await dbExecute.getAll(tableName);
        return data.map(c => { return new Type(c) });
    }
    static async getCustom(limit, offset) {
        const data = await dbExecute.getCustom(limit, offset, tableName);
        return data.map(c => { return new Type(c) });
    }
    static async insert(entity) {
        let query = queryHelper.insert(entity, null, tableName);
        query += `returning "type" `
        const data = await dbExecute.customQuery(query);
        return data;
    }
    static async deleteCartItem(brandName) {
        const query = `DELETE FROM "${tableName}"
                        WHERE "type"=${brandName};`
        return await dbExecute.customQuery(query);
    }
}