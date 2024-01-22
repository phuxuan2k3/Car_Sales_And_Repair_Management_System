const { response } = require('express');
const dbExecute = require('../utils/dbExecute');
const tableName = 'auto_part';
const { pgp } = require('../config/configDatabase');
const queryHelper = pgp.helpers;



module.exports = class AutoPart {
    constructor(obj) {
        this.ap_id = obj.ap_id;
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
        let query = queryHelper.insert(entity, null, tableName);
        query += ` RETURNING ap_id;`;
        return await dbExecute.customQuery(query);
    }
    static async update(id, entity) {
        let query = pgp.helpers.update(entity, null, tableName);
        query += ` WHERE "ap_id" = ${id};`;
        return await dbExecute.customQuery(query);
    }
    static async delete(id) {
        let query = `DELETE  FROM "${tableName}"`;
        query += ` WHERE "ap_id" = ${id};`;
        return await dbExecute.customQuery(query);
    }
    static async getAutoPartByID(id) {
        let query = `SELECT * FROM "${tableName}" WHERE "ap_id"=${id}`
        return await dbExecute.customQuery(query);
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
    static async getMostAp() {
        let query = `SELECT * FROM ${tableName} ORDER BY quantity DESC LIMIT 1;`
        return (await dbExecute.customQuery(query))[0];
    }
}