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
    selectCount() {
        this._selectQuery = 'COUNT(*)';
        return this;
    }
    selectAll() {
        this._selectQuery = '*';
        return this;
    }
    selectCols(colArray) {
        this._selectQuery = colArray.join(', ');
        return this;
    }
    join(tableName, conditionString) {
        this._joinQueryArray.push(`JOIN ${tableName} ON ${conditionString}`);
        return this;
    }
    equal(col, val) {
        const struct = `AND $1:name = $2:value`
        const query = pgp.as.format(struct, [col, val]);
        this._middleQueryArray.push(query);
        return this;
    }
    like(col, key) {
        const struct = `AND $1:name LIKE \'%$2:value%\'`
        const query = pgp.as.format(struct, [col, key]);
        this._middleQueryArray.push(query);
        return this;
    }
    ilike(col, key) {
        const struct = `AND $1:name ILIKE \'%$2:value%\'`
        const query = pgp.as.format(struct, [col, key]);
        this._middleQueryArray.push(query);
        return this;
    }
    in(col, valArray) {
        const struct = `AND $1:name IN($2:csv)`;
        const query = pgp.as.format(struct, [col, valArray]);
        this._middleQueryArray.push(query);
        return this;
    }
    between(col, low, high) {
        const struct = `AND $1:name BETWEEN $2:value AND $3:value`;
        const query = pgp.as.format(struct, [col, low, high]);
        this._middleQueryArray.push(query);
        return this;
    }
    orderBy(col, isAsc) {
        const queryAsc = isAsc ? 'ASC' : 'DESC';
        const struct = `$1:name ${queryAsc}`;
        const query = pgp.as.format(struct, [col]);
        this._orderByQueryArray.push(query);
        return this;
    }
    paging(perPage, page) {
        const offset = perPage * (page - 1);
        const struct = `LIMIT $1:value OFFSET $2:value`;
        const query = pgp.as.format(struct, [perPage, offset]);
        this._limitOffsetQuery = query;
        return this;
    }
    // combos
    defaultCountPaging(perPage, page) {
        this.selectCount();
        this.paging(perPage, page);
        return this;
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
        this.colArray = null;
        this.dataObj = null;
        this.returnColArray = null;
    }
    default(dataObj, returnColArray) {
        this.dataObj = dataObj;
        this.returnColArray = returnColArray;
        return this;
    }
    retrive() {
        const returnColsQuery = this.returnColArray ? " RETURNING " + this.returnColArray.join(', ') : '';
        const query = pgp.helpers.insert(this.dataObj, this.colArray, this._tablename) + returnColsQuery;
        return query;
    }
    async execute(type = 'one') {
        const query = this.retrive();
        return await db[type](query);
    }
}

class UpdateQuery extends Query {
    constructor(tablename) {
        super(tablename);
        this.colArray = null;
        this.dataObj = null;
        this._primaryKeyArray = [];
    }
    addPrimaryKey(condition) {
        this._primaryKeyArray.push(condition);
    }
    default(dataObj, primaryKeyArray) {
        this.dataObj = dataObj;
        this._primaryKeyArray = primaryKeyArray;
        return this;
    }
    retrive() {
        const where = this._primaryKeyArray.length === 0 ? '' : " WHERE " + this._primaryKeyArray.join(' AND ');
        const query = pgp.helpers.update(this.dataObj, this.colArray, this._tablename) + where;
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
        this.dataObj = null;
        this._whereConditionArray = [];
    }
    addWhereCondition(condition) {
        this._whereConditionArray.push(condition);
    }
    default(dataObj, whereConditionArray) {
        this.dataObj = dataObj;
        this._whereConditionArray = whereConditionArray;
        return this;
    }
    retrive() {
        const where = this._whereConditionArray.length === 0 ? '' : " WHERE " + this._whereConditionArray.join(' AND ');
        const query = `DELETE FROM ${this._tablename}${where}`;
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

var sq = new SelectQuery('test');
sq.selectCount().between('t', 1, 10).execute('any');

module.exports = {
    SelectQuery,
    InsertQuery,
    UpdateQuery,
    DeleteQuery,
}