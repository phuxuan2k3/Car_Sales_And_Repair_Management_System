const { db } = require('../config/dbConnector');
const { pgp } = require('../config/dbConnector');
require('dotenv').config();
const ENV = process.env;
module.exports = class Categories {
    constructor(u) {
        this.ProID = u.ProID;
        this.ProName = u.ProName;
        this.TinyDes = u.TinyDes;
        this.FullDes = u.FullDes;
        this.Price = u.Price;
        this.CatID = u.CatID;
        this.Quantity = u.Quantity;

    }
    async save() {
        const query = pgp.helpers.insert(this, null, 'Products');
        await db.none(query);
    }
    static async getCustom(limit, offset) {
        const query = `SELECT * FROM "Products" ORDER BY "CatID" LIMIT ${limit} OFFSET ${offset}`;
        return await db.any(query);
    }
    static async countRecords() {
        const query = `select count(*) from "Products";`
        return await db.one(query);
    }
    static async deleteById(id) {
        const query = `delete from "Products" where "ProID" = ${id};`;
        return await db.none(query);
    }
    static async deleteProductsOfCat(CatID) {
        const query = `delete from "Products" where "CatID" = ${CatID};`;
        return await db.none(query);
    }
}