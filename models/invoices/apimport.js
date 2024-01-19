const dbExecuteImp = require('../../utils/dbExecute.imp');
const { SelectQuery, InsertQuery, UpdateQuery, ExactUpdateQuery, DeleteQuery } = require('../../utils/queryBuilder');
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
        const data = await SelectQuery.init(tableNameInvoice).setSelectAll().execute();
        return data;
    }
    // get all car invoices by page, by store manager, NOT-TEST
    static async getByStoreManager(sm_id) {
        const data = await SelectQuery.init(tableNameInvoice).setSelectAll().addEqual('sm_id', sm_id).execute();
        return data;
    }

    // cud
    static async insert(entity) {
        const res = await InsertQuery.init(tableNameInvoice).default(entity, ['importinvoice_id']).execute();
        return res;
    }
    static async update(entity) {
        const res = await ExactUpdateQuery.init(tableNameInvoice).default(entity, ['importinvoice_id']).execute();
        return res;
    }
    static async delete({ importinvoice_id }) {
        const res = await DeleteQuery.init(tableNameInvoice).default({ importinvoice_id }).execute();
        return res;
    }
}

// >>>> =============================================
// Test set flag to 1 for testing
// <<<< =============================================

// Car Report
if (0) {
    (async () => {
        // in: invoice id
        // out: Array of CarReport
        var test = await CarReport.getCarReports(300);
        console.log(test);

        // in: CarReport 
        // out: {importinvoice_id, car_id}
        var test = CarReport.castParam(299, 12, 5, new Date());
        var res = await CarReport.insert(test);
        console.log(res);

        // in: CarReport
        // out: rowCount
        var test = await CarReport.update(CarReport.castParam(299, 12, 0, new Date()));
        console.log(test);

        // in: invoice id, car id (obj)
        // out: rowCount
        var test = await CarReport.delete({ importinvoice_id: 299, car_id: 12 });
        console.log(test);
    })();
}

// Car Invoice
if (0) {
    (async () => {
        // in:
        // out: Array of Invoices
        var test = await CarInvoice.getAll();
        console.log(test);
        console.log(test[0]);

        // in: sm_id (store manager id)
        // out: Array of Invoices
        var test = await CarInvoice.getByStoreManager(3);
        console.log(test);

        // in: CarInvoice
        // out: {importinvoice_id}
        var test = await CarInvoice.insert(CarInvoice.castParam(3, 404));
        console.log(test);

        // in: CarInvoice
        // out: rowCount
        var test = await CarInvoice.update(CarInvoice.castParam(9, 404));
        console.log(test);

        // in: importinvoice_id (obj)
        // out: rowCount
        var test = await CarInvoice.delete({ importinvoice_id: 404 });
        console.log(test);
    })();
}



module.exports = { CarInvoice, CarReport };


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
    // get aps from a invoice
    static async getApReports(importinvoice_id) {
        const data = await SelectQuery.init(tableNameReport).setSelectAll().addEqual('importinvoice_id', importinvoice_id).execute();
        return data.map(d => { return CarReport.castObj(d) });
    }

    // cud
    static async insert(entity) {
        const res = await InsertQuery.init(tableNameReport).default(entity, ['importinvoice_id', 'car_id']).execute();
        return res;
    }
    static async update(entity) {
        const res = await ExactUpdateQuery.init(tableNameReport).default(entity, ['importinvoice_id', 'car_id']).execute();
        return res;
    }
    static async delete({ importinvoice_id, car_id }) {
        const res = await DeleteQuery.init(tableNameReport).default({ importinvoice_id, car_id }).execute();
        return res;
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