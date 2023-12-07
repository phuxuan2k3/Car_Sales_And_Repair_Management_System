const { db } = require('../config/dbConnector');
const { pgp } = require('../config/dbConnector');
require('dotenv').config();
const ENV = process.env;
module.exports = class Categories {
    constructor(u) {
        this.CatID = u.CatID;
        this.CatName = u.CatName;
    }
    async save() {
        const query = pgp.helpers.insert(this, null, 'Categories');
        await db.none(query);
    }
    static async getCustom(limit, offset) {
        const query = `SELECT * FROM "Categories" ORDER BY "CatID" LIMIT ${limit} OFFSET ${offset}`;
        return await db.any(query);
    }
    static async countRecords() {
        const query = `select count(*) from "Categories";`
        return await db.one(query);
    }
    static async deleteById(id) {
        const query = `delete from "Categories" where "CatID" = ${id};`;
        return await db.none(query);
    }
}