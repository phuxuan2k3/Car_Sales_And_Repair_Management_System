const dbExecuteImp = require('../../utils/dbExecute.imp');
const { SelectQuery, InsertQuery, UpdateQuery } = require('../../utils/queryBuilder');
const tableNameInvoice = 'car_import_invoice';
const tableNameReport = 'car_import_report';

class CarReport {
    constructor() {
        this.importinvoice_id = null;
        this.car_id = null;
        this.quantity = null;
        this.date = new Date();
    }
    static castObj(obj) {
        const res = new CarReport();
        res.importinvoice_id = obj.importinvoice_id;
        res.car_id = obj.car_id;
        res.quantity = obj.quantity;
        res.date = this.date;
        return res;
    }
    static castParam(importinvoice_id, car_id, quantity, date) {
        let res = new CarReport();
        res.importinvoice_id = importinvoice_id;
        res.car_id = car_id;
        res.quantity = quantity;
        res.date = date;
        return res;
    }

    // TODO: Uses new query builder

    // read
    // get cars from a invoice
    static async getCarReports(importinvoice_id) {
        const sq = new SelectQuery(tableNameReport);
        const data = await sq.selectAll().equal('importinvoice_id', importinvoice_id).execute();
        return data.map(d => { return CarReport.castObj(d) });
    }

    // cud
    static async insert(entity) {
        const iq = new InsertQuery(tableNameReport);
        const res = await iq.default(entity, ['importinvoice_id', 'car_id']).execute();
        return res;
    }
    static async update(importinvoice_id, car_id, entity) {
        const uq = new UpdateQuery(tableNameReport);
        const res = await uq.default(entity, ['importinvoice_id = ', 'car_id']).execute();
        return await dbExecuteImp.update(entity, { importinvoice_id, car_id }, tableNameReport);
    }
    static async delete(importinvoice_id, car_id) {
        return await dbExecuteImp.delete({ importinvoice_id, car_id }, tableNameReport);
    }
}

class CarInvoice {
    constructor() {
        this.sm_id = null;
        this.importinvoice_id = null;
    }
    static castObj(obj) {
        const res = new CarInvoice();
        res.sm_id = obj.sm_id;
        res.importinvoice_id = obj.importinvoice_id;
        return res;
    }
    static castParam(sm_id, importinvoice_id) {
        const res = new CarInvoice();
        res.sm_id = sm_id;
        res.importinvoice_id = importinvoice_id;
        return res;
    }

    // read
    // get all car invoices
    static async getAll() {
        const data = await dbExecuteImp.getAll(tableNameInvoice);
        return data;
    }
    // get all car invoices by page, by store manager
    static async getCustom(sm_id, page, perPage) {
        let query;
        const data = await dbExecuteImp.getCustom(limit, offset, tableNameInvoice);
        return data;
    }
    // get by store manager
    static async getByStoreManager(sm_id) {
        let query = `select * from "${tableNameInvoice}" where "sm_id"=${sm_id}`;
        const data = await dbExecuteImp.customQuery(query);
        return data;
    }

    // cud
    static async insert(entity) {
        return dbExecuteImp.insert(entity, ['importinvoice_id'], tableNameInvoice);
    }
    static async update(importinvoice_id, entity) {
        return await dbExecuteImp.update(entity, { importinvoice_id }, tableNameInvoice);
    }
    static async delete(importinvoice_id) {
        return await dbExecuteImp.delete({ importinvoice_id }, tableNameInvoice);
    }
}


module.exports = { CarInvoice, CarReport };