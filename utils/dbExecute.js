const { db, pgp } = require('../config/configDatabase');
const queryHelper = pgp.helpers;
const { tryCatchFunction } = require('./tryCatch');

//Todo: the name of the field may not match with the name of its in database (eg: "id" or "userID"), so we need to change if neccessary.
module.exports = {
    getAll: tryCatchFunction(async (tableName) => {
        const query = `SELECT * FROM "${tableName}";`;//'order by ...' may be added if it does not follow any order.
        return await db.any(query);
    }),
    getCustom: tryCatchFunction(async (limit, offset, tableName) => {
        const query = `SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`;//order by
        return await db.any(query);
    }),
    getById: tryCatchFunction(async (id, tableName) => {
        const query = `SELECT * FROM "${tableName}" WHERE "id" = ${id};`;//'order by ...' may be added if it does not follow any order.
        return await db.oneOrNone(query);
    })
    ,
    insert: tryCatchFunction(async (entity, tableName) => {
        let query = queryHelper.insert(entity, null, tableName);
        query += `RETURNING id;`;
        return await db.one(query);
    })
    ,
    delete: tryCatchFunction(async (id, tableName) => {
        let query = `DELETE  FROM "${tableName}"`;//'order by ...' may be added if it does not follow any order.
        query += `WHERE "id" = ${id};`;
        return await db.none(query);
    })
    ,
    update: tryCatchFunction(async (id, entity, tableName) => {
        let query = pgp.helpers.update(entity, null, tableName);
        query += `WHERE "id" = ${id};`;
        return await db.none(query);
    })
}