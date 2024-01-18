const { response } = require('express');
const dbExecute = require('../utils/dbExecute');
const { TableName } = require('pg-promise');
const tableName = 'fixed_car';

module.exports = class FixedCar {
    constructor(obj) {
        this.customerId = obj.id;
        this.status = obj.status;
        this.car_plate = obj.car_plate;
    }
    static async getAll() {
        const data = await dbExecute.getAll(tableName);
        return data.map(c => { return new FixedCar(c) });
    }
    static async getCustom(limit, offset) {
        const data = await dbExecute.getCustom(limit, offset, tableName);
        return data.map(c => { return new FixedCar(c) });
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
    static async getFixedCarByCusId(id) {
        let query = `select * from "${tableName}" where "id"=${id}`
        const data = await dbExecute.customQuery(query);
        return data.map(c => { return new FixedCar(c) });
    }
}