const { db } = require('../config/dbConnector');
const { pgp } = require('../config/dbConnector');
require('dotenv').config();
const ENV = process.env;
module.exports = class Users {
    constructor(u) {
        this.Username = u.Username;
        this.Password = u.Password;
        this.Name = u.Name;
        this.Email = u.Email;
        this.DOB = u.DOB;
        this.Permission = u.Permission || ENV.USERPERMISSION;
    }
    async save() {
        const query = pgp.helpers.insert(this, null, 'Users');
        await db.none(query);
    }
    static async findByUsername(Username) {
        const query = `select * from "Users" where "Username" = '${Username}';`
        const record = await db.oneOrNone(query);
        return record;
    }
    static async findByEmail(email) {
        const query = `select * from "Users" where "Email" = '${email}';`
        const record = await db.oneOrNone(query);
        return record;
    }
}