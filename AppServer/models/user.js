const createPaymentAccount = require('../utils/createPaymentAccount');
const dbExecute = require('../utils/dbExecute');
const { SelectQuery, InsertQuery, ExactUpdateQuery, DeleteQuery } = require('../utils/queryBuilder');
const tableName = 'user_info';

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
        if (!entity.permission) {
            entity.permission = 'cus';
        }
        try {
            const res = await dbExecute.insert(entity, tableName);
            if (entity.permission == 'cus') {
                await createPaymentAccount(res.id);
            }
            return res;
        } catch (error) {
            throw error;
        }
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
    static async getByUsername(username) {
        let query = `SELECT * from ${tableName} where "username" = '${username}';`;
        return await dbExecute.customQuery(query);
    }
    //todo: add more function that system need
    static async getByUsernameSearchByPermissionByPage(username, permission, page, perPage) {
        const sq = SelectQuery.init(tableName)
            .addIlikeValue('username', username)
            .setPaging(perPage, page);
        if (permission != '') {
            sq.addEqual('permission', permission)
        }
        const data = await sq.execute();
        return data;
    }
    static async getCountByUsernameSearchByPermission(username, permission) {
        const sq = SelectQuery.init(tableName)
            .setSelectCount()
            .addIlikeValue('username', username);
        if (permission != '') {
            sq.addEqual('permission', permission)
        }
        const data = await sq.execute('one');
        return data.count;
    }
    // return {id}
    static async insertFromAdmin(entity) {
       // const res2 = await InsertQuery.init(tableName).default(entity, ['id']).execute();
       // return res;

        if (!entity.permission) {
            entity.permission = 'cus';
        }
        try {
            const res = await dbExecute.insert(entity, tableName);
            if (entity.permission == 'cus') {
                await createPaymentAccount(res.id);
            }
            return res;
        } catch (error) {
            throw error;
        }

    }
    // return rows affected
    static async updateFromAdmin(entity) {
        const res = await ExactUpdateQuery.init(tableName).default(entity, ['id']).execute();
        return res;
    }
    // return rows affected
    static async deleteFromAdmin({ id }) {
        const user = await module.exports.getById(id);
        if (user.permission === 'ad') {
            // cant delete admin
            return -1;
        }
        const res = await DeleteQuery.init(tableName).default({ id }).execute();
        return res;
    }
    // 
    static async checkUsernameExists(username) {
        const res = await SelectQuery.init(tableName).setSelectCount().addEqual('username', username).execute('one');
        const count = parseInt(res.count) || 0;
        if (count === 0) {
            return false;
        }
        return true;
    }
    static async countCustomer() {
        let query = `select count(*) from ${tableName} where permission ='cus'`;
        return (await dbExecute.customQuery(query))[0];
    }
    static async countEmployee() {
        let query = `select count(*) from ${tableName} where permission !='cus'`;
        return (await dbExecute.customQuery(query))[0];
    }
}