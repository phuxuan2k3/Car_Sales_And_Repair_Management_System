const { db, pgp } = require('../config/configDatabase');
const queryHelper = pgp.helpers;

function ands(object) {
    let ands = '';
    let i = 0;
    let len = Object.keys(object).length;
    for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
            const element = object[key];
            ands += `${key} = ${element}`;
            i++;
            if (i >= len) {
                break;
            }
            ands += ' and ';
        }
    }
    return ands;
}

//Todo: the name of the field may not match with the name of its in database (eg: "id" or "userID"), so we need to change if neccessary.
module.exports = {
    getAll: async (tableName) => {
        const query = `SELECT * FROM "${tableName}";`;//'order by ...' may be added if it does not follow any order.
        return await db.any(query);
    },
    getCustom: async (limit, offset, tableName) => {
        const query = `SELECT * FROM "${tableName}" OFFSET ${offset} LIMIT ${limit}`;//order by
        return await db.any(query);
    },
    getById: async (id, tableName) => {
        const query = `SELECT * FROM "${tableName}" WHERE "id" = ${id};`;//'order by ...' may be added if it does not follow any order.
        return await db.oneOrNone(query);
    },
    insert: async (entity, returnCols, tableName) => {
        let query = queryHelper.insert(entity, null, tableName);
        query += `RETURNING ${returnCols.join(',')};`;
        return await db.one(query);
    },
    update: async (entity, conditionObj, tableName) => {
        let query = pgp.helpers.update(entity, null, tableName);
        query += ` WHERE ${ands(conditionObj)};`;
        return await db.result(query, null, res => res.rowCount);
    },
    delete: async (conditionObj, tableName) => {
        let query = `DELETE  FROM "${tableName}"`;//'order by ...' may be added if it does not follow any order.
        query += ` WHERE ${ands(conditionObj)};`;
        return await db.result(query, null, res => res.rowCount);
    },
    customQuery: async (query) => {
        return await db.query(query);
    }
}