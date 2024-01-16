const { response } = require('express');
const dbExecute = require('../utils/dbExecute');
const { TableName } = require('pg-promise');
const tableName = 'auto_part';

module.exports = class AutoPart {
    constructor(obj){
        this.id = obj.ap_id;
        this.name = obj.name;
        this.supplier = obj.supplier;
        this.quantity = obj.quantity;
    }
    static async getAll() {
        const data = await dbExecute.getAll(tableName);
        return data.map(c =>{ return new AutoPart(c)});
    }
    static async getCustom(limit, offset) {
        const data = await dbExecute.getCustom(limit, offset, tableName);
        return data.map(c =>{ return new AutoPart(c)});
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
}