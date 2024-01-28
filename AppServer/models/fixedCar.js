const { response } = require('express');
const dbExecute = require('../utils/dbExecute');
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
        const check = await module.exports.getFixedCarByPlate(entity.car_plate);
        for (const e of check) {
            if(e.car_plate == entity.car_plate && e.id != entity.id) return false;
        }
        if(check.length <= 0) await dbExecute.insert(entity, tableName);
        return true;
    }
    static async update(id, entity) {
        return await dbExecute.update(id, entity, tableName);
    }
    static async delete(id) {
        return await dbExecute.delete(id, tableName);
    }
    static async getFixedCarByCusId(id) {
        const query = `select * from "${tableName}" where "id"='${id}'`
        return await dbExecute.customQuery(query);
    }
    static async getFixedCarByPlate(plate) {
        const query = `select * from "${tableName}" where "car_plate"='${plate}'`
        return await dbExecute.customQuery(query);
    }
    static async getFixedCarByCusIdAndSearch(id,car_plate){
        let query = `select * from "${tableName}" where "id"='${id}'`
        if(car_plate != null) query +=  ` and  "car_plate" ilike '%${car_plate}%'`
        return await dbExecute.customQuery(query);
    }
}