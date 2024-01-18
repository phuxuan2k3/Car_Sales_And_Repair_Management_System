const { response } = require('express');
const dbExecute = require('../utils/dbExecute');
const { TableName } = require('pg-promise');
const tableName = 'auto_part';


module.exports = class AutoPart {
    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.supplier = obj.supplier;
        this.quantity = obj.quantity;
        this.price = obj.price;
    }
    static async getAll() {
        const data = await dbExecute.getAll(tableName);
        return data.map(c => { return new AutoPart(c) });
    }
    static async getCustom(limit, offset) {
        const data = await dbExecute.getCustom(limit, offset, tableName);
        return data.map(c => { return new AutoPart(c) });
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
    static async getAutoPartByID(id) {
        const data = await dbExecute.getById(id,tableName)
        return new AutoPart(data);
    }
    static async getApPage(suppliers, limit, offset) {
        let query = `select * from "${tableName}"`
        let filterArr = [];
        let supplierArr = [];
        let supplierQuery;
        if (suppliers != undefined) {
            for (const supplier of suppliers) {
                supplierArr.push(`"supplier"='${supplier}'`)
            }
            supplierQuery = supplierArr.join(' or ');
            supplierQuery = `( ${supplierQuery} )`
            filterArr.push(supplierQuery);
        }
        let filterString = filterArr.join(' and ');
        if (filterArr.length != 0) query += ' where ' + filterString;
        const totalPage = Math.ceil((await dbExecute.customQuery(query)).length / limit);
        query += ` offset ${offset} limit ${limit}`;
        const data = await dbExecute.customQuery(query);
        const apData = data.map(c => { return new AutoPart(c) });
        console.log(query)
        return {
            totalPage: totalPage,
            data: apData,
        }
    }
    static async getAllSupplier() {
        const query = `select distinct "supplier" from "${tableName}"`
        const data = await dbExecute.customQuery(query);
        return data;
    }
}