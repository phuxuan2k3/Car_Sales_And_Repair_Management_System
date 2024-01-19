const { pgp, db } = require('../config/configDatabase');

class Query {
    constructor(tableName) {
        this._tablename = tableName;
    }
}

class SelectQuery extends Query {
    constructor(tableName) {
        super(tableName);
        this._selectQuery = '*';
        this._joinQueryArray = [];
        this._middleQueryArray = [];
        this._orderByQueryArray = [];
        this._limitOffsetQuery = '';
    }
    static init(tableName) {
        return new SelectQuery(tableName);
    }
    setSelectCount() {
        this._selectQuery = 'COUNT(*)';
        return this;
    }
    setSelectAll() {
        this._selectQuery = '*';
        return this;
    }
    setSelectCustom(customArray) {
        this._selectQuery = customArray.join(', ');
        return this;
    }
    addJoin(tableName, conditionString) {
        this._joinQueryArray.push(`JOIN ${tableName} ON ${conditionString}`);
        return this;
    }
    addEqual(col, val) {
        const struct = `AND $1:name = $2:value`
        const query = pgp.as.format(struct, [col, val]);
        this._middleQueryArray.push(query);
        return this;
    }
    addLike(col, key) {
        const struct = `AND $1:name LIKE \'%$2:value%\'`
        const query = pgp.as.format(struct, [col, key]);
        this._middleQueryArray.push(query);
        return this;
    }
    addIlike(col, key) {
        const struct = `AND $1:name ILIKE \'%$2:value%\'`
        const query = pgp.as.format(struct, [col, key]);
        this._middleQueryArray.push(query);
        return this;
    }
    addIn(col, valArray) {
        const struct = `AND $1:name IN($2:csv)`;
        const query = pgp.as.format(struct, [col, valArray]);
        this._middleQueryArray.push(query);
        return this;
    }
    addBetween(col, low, high) {
        const struct = `AND $1:name BETWEEN $2:value AND $3:value`;
        const query = pgp.as.format(struct, [col, low, high]);
        this._middleQueryArray.push(query);
        return this;
    }
    addOrderBy(col, isAsc) {
        const queryAsc = isAsc ? 'ASC' : 'DESC';
        const struct = `$1:name ${queryAsc}`;
        const query = pgp.as.format(struct, [col]);
        this._orderByQueryArray.push(query);
        return this;
    }
    setPaging(perPage, page) {
        const offset = perPage * (page - 1);
        const struct = `LIMIT $1:value OFFSET $2:value`;
        const query = pgp.as.format(struct, [perPage, offset]);
        this._limitOffsetQuery = query;
        return this;
    }
    removePaging() {
        this._limitOffsetQuery = '';
    }
    retrive() {
        const select = this._selectQuery;
        const join = this._joinQueryArray.join(' ');
        const middle = this._middleQueryArray.join(' ');
        const orderBy = this._orderByQueryArray.length === 0 ? '' : "ORDER BY " + this._orderByQueryArray.join(' ');
        const limitOffset = this._limitOffsetQuery;
        const query = `
        SELECT ${select}
        FROM ${this._tablename}
        ${join}
        WHERE TRUE
        ${middle}
        ${orderBy}
        ${limitOffset}
        `;
        return query;
    }
    async execute(type = 'query') {
        const query = this.retrive();
        return await db[type](query);
    }
}

class InsertQuery extends Query {
    constructor(tablename) {
        super(tablename);
        this._colArray = null;
        this._dataObj = null;
        this._returnColArray = null;
    }
    static init(tableName) {
        return new InsertQuery(tableName);
    }
    setDataObj(dataObj) {
        this._dataObj = dataObj;
        return this;
    }
    setColArray(colArray) {
        this._colArray = colArray;
        return this;
    }
    setReturnColArray(returnColArray) {
        this._returnColArray = returnColArray;
        return this;
    }
    default(dataObj, returnColArray) {
        this._dataObj = dataObj;
        this._returnColArray = returnColArray;
        return this;
    }
    retrive() {
        const returnColsQuery = this._returnColArray ? " RETURNING " + this._returnColArray.join(', ') : '';
        const query = pgp.helpers.insert(this._dataObj, this._colArray, this._tablename) + returnColsQuery;
        return query;
    }
    async execute(type = 'one') {
        const query = this.retrive();
        return await db[type](query);
    }
}

// update at the same record dataObj (can't change primary keys)
class ExactUpdateQuery extends Query {
    constructor(tablename) {
        super(tablename);
        this.colArray = null;
        this._dataObj = {};
        this._primaryKeyArray = [];
    }
    static init(tableName) {
        return new ExactUpdateQuery(tableName);
    }
    setDataObj(dataObj) {
        this._dataObj = dataObj;
        return this;
    }
    addPrimaryKey(primaryKey) {
        this._primaryKeyArray.push(primaryKey);
        return this;
    }
    default(dataObj, primaryKeyArray) {
        this._dataObj = dataObj;
        this._primaryKeyArray = primaryKeyArray;
        return this;
    }
    retrive() {
        let where = '';
        if (this._primaryKeyArray.length > 0) {
            where = ' WHERE ';
            this._primaryKeyArray.forEach((pk, i) => {
                const struct = '$1:name = $2:value ';
                where += pgp.as.format(struct, [pk, this._dataObj[pk]]);
                if (i < this._primaryKeyArray.length - 1) {
                    where += 'AND ';
                }
            });
        }
        const query = pgp.helpers.update(this._dataObj, this.colArray, this._tablename) + where;
        return query;
    }
    async execute(type = 'result') {
        const query = this.retrive();
        if (type === 'result') {
            return await db[type](query, null, res => res.rowCount);
        }
        return await db[type](query);
    }
}

class DeleteQuery extends Query {
    constructor(tablename) {
        super(tablename);
        this._primaryKeyObj = null;
        this._conditionArray = [];
    }
    static init(tableName) {
        return new DeleteQuery(tableName);
    }
    setPrimaryKeyObj(primaryKeyObj) {
        this._primaryKeyObj = primaryKeyObj;
        return this;
    }
    addCondition(condition) {
        this._conditionArray.push(condition);
        return this;
    }
    default(primaryKeyObj) {
        this._primaryKeyObj = primaryKeyObj;
        return this;
    }
    retrive() {
        let conditions = this._conditionArray.length === 0 ? '' : this._conditionArray.join(' AND ');
        let primaryKeys = '';
        let propertyKeys = Object.keys(this._primaryKeyObj);
        if (propertyKeys.length > 0) {
            propertyKeys.forEach((key, i) => {
                const value = this._primaryKeyObj[key];
                const struct = '$1:name = $2:value ';
                primaryKeys += pgp.as.format(struct, [key, value]);
                if (i < propertyKeys.length - 1) {
                    primaryKeys += 'AND '
                }
            });
        }
        let where = '';
        let midAnd = '';
        if (conditions !== '' || primaryKeys !== '') {
            where = ' WHERE ';
        }
        if (conditions !== '' && primaryKeys !== '') {
            midAnd = ' AND ';
        }
        const struct = `DELETE FROM $1:name${where}${primaryKeys}${midAnd}${conditions}`;
        const query = pgp.as.format(struct, [this._tablename]);
        return query;
    }
    async execute(type = 'result') {
        const query = this.retrive();
        if (type === 'result') {
            return await db[type](query, null, res => res.rowCount);
        }
        return await db[type](query);
    }
}

// >>>> =============================================
// test area
// <<<< =============================================

// var iq = new InsertQuery('test');
// iq.default({ id: 12, t_id: 233 }, ['id', 't_id']);
// var q = iq.retrive();
// console.log(q);

// var sq = new SelectQuery('test');
// console.log(sq.retrive());
// sq.selectCount();
// console.log(sq.retrive());
// sq.between('t', 1, 10);
// console.log(sq.retrive());
// sq.ilike('t', 'anngo');
// console.log(sq.retrive());
// sq.in('t', [1, 3, 4, 6]);
// console.log(sq.retrive());
// sq.join('temp', 'test.temp = temp.id');
// console.log(sq.retrive());
// sq.orderBy('id', false);
// console.log(sq.retrive());
// sq.paging(10, 3);
// console.log(sq.retrive());

// var sq = new SelectQuery('test');
// sq.selectCount().between('t', 1, 10).execute('any');

// console.log(ExactUpdateQuery.init('test').default({ id: 10, id2: 123, name: 'an' }, ['id', 'id2']).retrive());
// console.log(ExactUpdateQuery.init('test').default({ id: 10, id2: 123, name: 'an' }, ['id']).retrive());
// console.log(ExactUpdateQuery.init('test').setDataObj({ id: 10, id2: 123, name: 'an' }).addPrimaryKey('id').addPrimaryKey('id2').retrive());

// console.log(DeleteQuery.init('test').setPrimaryKeyObj({ id: 10, id2: 123 }).retrive());
// console.log(DeleteQuery.init('test').setPrimaryKeyObj({ id: 10, id2: 123 }).addCondition('"name" = \'Test\'').retrive());



module.exports = {
    SelectQuery,
    InsertQuery,
    ExactUpdateQuery,
    DeleteQuery,
}