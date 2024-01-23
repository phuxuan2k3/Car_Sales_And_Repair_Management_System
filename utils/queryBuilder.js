const { pgp, db } = require('../config/configDatabase');

// helper
function removeEmptyProperty(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null && v != undefined));
}
async function execute(query, type = 'query') {
    return await db[type](query);
}

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
        this._groupByQueryArray = [];
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
    addEqualValue(col, val, colType = 'name') {
        const struct = `AND $1:${colType} = $2:value`
        const query = pgp.as.format(struct, [col, val]);
        this._middleQueryArray.push(query);
        return this;
    }
    addEqual(col, val, colType = 'name') {
        const struct = `AND $1:${colType} = $2`
        const query = pgp.as.format(struct, [col, val]);
        this._middleQueryArray.push(query);
        return this;
    }
    addLikeValue(col, key, colType = 'name') {
        const struct = `AND $1:${colType} LIKE \'%$2:value%\'`
        const query = pgp.as.format(struct, [col, key]);
        this._middleQueryArray.push(query);
        return this;
    }
    addIlikeValue(col, key, colType = 'name') {
        const struct = `AND $1:${colType} ILIKE \'%$2:value%\'`
        const query = pgp.as.format(struct, [col, key]);
        this._middleQueryArray.push(query);
        return this;
    }
    addInCsv(col, valArray, colType = 'name') {
        const struct = `AND $1:${colType} IN($2:csv)`;
        const query = pgp.as.format(struct, [col, valArray]);
        this._middleQueryArray.push(query);
        return this;
    }
    addBetweenValue(col, low, high, colType = 'name') {
        const struct = `AND $1:${colType} BETWEEN $2:value AND $3:value`;
        const query = pgp.as.format(struct, [col, low, high]);
        this._middleQueryArray.push(query);
        return this;
    }
    addBetweenDate(col, dlow, dhigh, colType = 'name') {
        const struct = `AND $1:${colType} BETWEEN $2::date AND $3::date`;
        const query = pgp.as.format(struct, [col, dlow, dhigh]);
        this._middleQueryArray.push(query);
        return this;
    }
    addGroupBy(col) {
        this._groupByQueryArray.push(col);
        return this;
    }
    addOrderBy(col, isAsc, colType = 'name') {
        const queryAsc = isAsc ? 'ASC' : 'DESC';
        const struct = `$1:${colType} ${queryAsc}`;
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
        const groupBy = this._groupByQueryArray.length === 0 ? '' : "GROUP BY " + this._groupByQueryArray.join(', ');
        const orderBy = this._orderByQueryArray.length === 0 ? '' : "ORDER BY " + this._orderByQueryArray.join(', ');
        const limitOffset = this._limitOffsetQuery;
        const query = `
        SELECT ${select}
        FROM ${this._tablename}
        ${join}
        WHERE TRUE
        ${middle}
        ${groupBy}
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
    // removes null properties from data object
    default(dataObj, returnColArray) {
        this._dataObj = removeEmptyProperty(dataObj);
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
    // removes null properties from data object
    default(dataObj, primaryKeyArray) {
        this._dataObj = removeEmptyProperty(dataObj);
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
// test area (for queries)
// <<<< =============================================

const test = 0;

if (test) {
    console.log(SelectQuery.init('test t')
        .setSelectCustom(['SUM(total_price)'])
        .addJoin('new n', 'n.id = t.newid')
        .addGroupBy('name')
        .retrive());
}

module.exports = {
    SelectQuery,
    InsertQuery,
    ExactUpdateQuery,
    DeleteQuery,
    execute
}