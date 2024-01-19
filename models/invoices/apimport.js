const { SelectQuery, InsertQuery, ExactUpdateQuery, DeleteQuery } = require('../../utils/queryBuilder');

const AIR_Table = {
    NAME: 'ap_import_report',
    importinvoice_id: 'importinvoice_id',
    ap_id: 'ap_id',
    quantity: 'quantity',
    date: 'date',
}

const AII_Table = {
    NAME: 'ap_import_invoice',
    importinvoice_id: 'importinvoice_id',
    sm_id: 'sm_id',
}


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
        const data = await SelectQuery.init(AIR_Table.NAME).setSelectAll().addEqual(AIR_Table.importinvoice_id, importinvoice_id).execute();
        return data.map(d => { return ApReport.castObj(d) });
    }

    // cud
    // return importinvoice_id, ap_id
    static async insert(entity) {
        const res = await InsertQuery.init(AIR_Table.NAME).default(entity, [AIR_Table.importinvoice_id, AIR_Table.ap_id]).execute();
        return res;
    }
    // return rows affected
    static async update(entity) {
        const res = await ExactUpdateQuery.init(AIR_Table.NAME).default(entity, [AIR_Table.importinvoice_id, AIR_Table.ap_id]).execute();
        return res;
    }
    // return rows affected
    static async delete({ importinvoice_id, car_id }) {
        const res = await DeleteQuery.init(AIR_Table.NAME).default({ importinvoice_id, car_id }).execute();
        return res;
    }
}

class ApInvoice {
    constructor() {
        this.sm_id = null;
        this.importinvoice_id = null;
    }
    static castObj(obj) {
        const res = new ApInvoice();
        res.sm_id = obj.sm_id;
        res.importinvoice_id = obj.importinvoice_id;
        return res;
    }
    static castParam(sm_id, importinvoice_id) {
        const res = new ApInvoice();
        res.sm_id = sm_id;
        res.importinvoice_id = importinvoice_id;
        return res;
    }

    // read
    // get all ap invoices
    static async getAll() {
        const data = await SelectQuery.init(AII_Table.NAME).setSelectAll().execute();
        return data.map(d => ApInvoice.castObj(d));
    }
    // get all ap invoices by page, by store manager, NOT-TEST
    static async getByStoreManager(sm_id) {
        const data = await SelectQuery.init(AII_Table.NAME).setSelectAll().addEqual(AII_Table.sm_id, sm_id).execute();
        return data.map(d => ApInvoice.castObj(d));
    }

    // cud
    // return importinvoice_id
    static async insert(entity) {
        const res = await InsertQuery.init(AII_Table.NAME).default(entity, [AII_Table.importinvoice_id]).execute();
        return res;
    }
    // return rows affected
    static async update(entity) {
        const res = await ExactUpdateQuery.init(AII_Table.NAME).default(entity, [AII_Table.importinvoice_id]).execute();
        return res;
    }
    // return rows affected
    static async delete({ importinvoice_id }) {
        const res = await DeleteQuery.init(AII_Table.NAME).default({ importinvoice_id }).execute();
        return res;
    }
}


// >>>> =============================================
// Test set flag to 1 for testing
// <<<< =============================================

// Ap Report
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




module.exports = { ApInvoice, ApReport };