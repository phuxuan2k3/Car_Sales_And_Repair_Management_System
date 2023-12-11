const { response } = require('express');
const dbExecute = require('../utils/dbExecute');
const { TableName } = require('pg-promise');
const tableName = 'User';

module.exports = class User {
    constructor(...args) {
        //Todo: assign value here
    }

    static async getAll() {
        return await dbExecute.getAll(tableName);
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
}