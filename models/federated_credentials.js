const dbExecute = require('../utils/dbExecute');
const tableName = 'federated_credentials';

module.exports = class FC {
    constructor(obj) {
        this.id = obj.id;
        this.user_id = obj.user_id;
        this.provider = obj.provider;
        this.subject = obj.subject;
    }
    static async getCustom(limit, offset) {
        return await dbExecute.getCustom(limit, offset, tableName);
    }
    static async insert(entity) {
        return await dbExecute.insert(entity, tableName);
    }
    static async update(id, entity) {
        return await dbExecute.update(id, entity, tableName);
    }
    static async delete(id) {
        return await dbExecute.delete(id, tableName);
    }
    static async getById(id) {
        return await dbExecute.getById(id, tableName);
    }
    static async getByProviderAndSubject(provider, subject) {
        let query = `SELECT * FROM ${tableName} WHERE provider = '${provider}' AND subject = '${subject}'`;
        return await dbExecute.customQuery(query);
    }
    //todo: add more function that system need
}