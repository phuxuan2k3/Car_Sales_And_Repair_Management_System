const dbExecuteImp = require('../../utils/dbExecute.imp');
const tableNameInvoice = 'ap_import_invoice';
const tableNameReport = 'ap_import_report';

class ApReport {
    constructor() {
        this.importinvoice_id = null;
        this.ap_id = null;
        this.quantity = null;
        this.date = new Date();
    }
    static castObj(obj) {
        const res = new ApReport();
        res.importinvoice_id = obj.importinvoice_id;
        res.ap_id = obj.ap_id;
        res.quantity = obj.quantity;
        res.date = this.date;
        return res;
    }
    static castParam(importinvoice_id, ap_id, quantity, date) {
        let res = new ApReport();
        res.importinvoice_id = importinvoice_id;
        res.ap_id = ap_id;
        res.quantity = quantity;
        res.date = date;
        return res;
    }

    // read
    // get cars from a invoice
    static async getApReports(importinvoice_id) {
        let query = `select * from "${tableNameReport}" where "importinvoice_id"=${importinvoice_id}`;
        const datas = await dbExecuteImp.customQuery(query);
        return datas.map(data => { return ApReport.castObj(data) });
    }

    // cud
    static async insert(entity) {
        return await dbExecuteImp.insert(entity, ['importinvoice_id', 'ap_id'], tableNameReport);
    }
    static async update(importinvoice_id, ap_id, entity) {
        return await dbExecuteImp.update(entity, { importinvoice_id, ap_id }, tableNameReport);
    }
    static async delete(importinvoice_id, ap_id) {
        return await dbExecuteImp.delete({ importinvoice_id, ap_id }, tableNameReport);
    }
}

class ApInvoice {
    constructor() {
        this.sm_id = null;
        this.importinvoice_id2 = null;
    }
    static castObj(obj) {
        const res = new ApInvoice();
        res.sm_id = obj.sm_id;
        res.importinvoice_id2 = obj.importinvoice_id2;
        return res;
    }
    static castParam(sm_id, importinvoice_id2) {
        const res = new ApInvoice();
        res.sm_id = sm_id;
        res.importinvoice_id2 = importinvoice_id2;
        return res;
    }

    // read
    // get all car invoices
    static async getAll() {
        const data = await dbExecuteImp.getAll(tableNameInvoice);
        return data;
    }
    // get all car invoices by page
    static async getCustom(limit, offset) {
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
        return dbExecuteImp.insert(entity, ['importinvoice_id2'], tableNameInvoice);
    }
    static async update(importinvoice_id2, entity) {
        return await dbExecuteImp.update(entity, { importinvoice_id2 }, tableNameInvoice);
    }
    static async delete(importinvoice_id2,) {
        return await dbExecuteImp.delete({ importinvoice_id2 }, tableNameInvoice);
    }
}


module.exports = { ApInvoice, ApReport };