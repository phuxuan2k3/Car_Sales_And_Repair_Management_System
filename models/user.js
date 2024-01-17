const dbExecute = require('../utils/dbExecute');
const tableName = 'User';

module.exports = class User {
    constructor(u) {
        this.username = u.username;
        this.password = u.password;
        this.permission = u.permission;
        this.id = u.id;
        this.firstname = u.firstname;
        this.phonenumber = u.phonenumber;
        this.dob = u.dob;
        this.address = u.address;
        this.lastname = u.lastname;
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
    static async getById(id) {
        return await dbExecute.getById(id, tableName);
    }
    //todo: add more function that system need
}