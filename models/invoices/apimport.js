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
    static async getReportsFromInvoice(importinvoice_id) {
        const data = await SelectQuery.init(AIR_Table.NAME).setSelectAll().addEqual(AIR_Table.importinvoice_id, importinvoice_id).execute();
        return data.map(d => { return ApReport.castObj(d) });
    }
    static async getReportsByDate(start, end) {
        const data = await SelectQuery.init(AIR_Table.NAME).setSelectAll().addBetweenDate(AIR_Table.date, start, end).execute();
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
    static async delete({ importinvoice_id, ap_id }) {
        const res = await DeleteQuery.init(AIR_Table.NAME).default({ importinvoice_id, ap_id }).execute();
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
// Test || set flag to 1 for testing
// <<<< =============================================

// const flagReport = 1;
// const flagInvoice = 0;

// // Ap Report
// if (flagReport) {
//     (async () => {
//         // in: invoice id
//         // out: Array of ApReport
//         var test = await ApReport.getReportsFromInvoice(300);
//         console.log(test);

//         // in: start, end date
//         // out: Array of ApReport
//         var test = await ApReport.getReportsByDate(new Date("2024/01/01"), new Date());
//         console.log(test);


//         // in: ApReport 
//         // out: {importinvoice_id, ap_id}
//         var test = ApReport.castParam(299, 18, 5, new Date());
//         var res = await ApReport.insert(test);
//         console.log(res);

//         // in: ApReport
//         // out: rowCount
//         var test = await ApReport.update(ApReport.castParam(299, 18, 0, new Date()));
//         console.log(test);

//         // in: invoice id, ap id (obj)
//         // out: rowCount
//         var test = await ApReport.delete({ importinvoice_id: 299, ap_id: 18 });
//         console.log(test);
//     })();
// }

// // Ap Invoice
// if (flagInvoice) {
//     (async () => {
//         // in:
//         // out: Array of Invoices
//         var test = await ApInvoice.getAll();
//         console.log(test);
//         console.log(test[0]);

//         // in: sm_id (store manager id)
//         // out: Array of Invoices
//         var test = await ApInvoice.getByStoreManager(3);
//         console.log(test);

//         // in: ApInvoice
//         // out: {importinvoice_id}
//         var test = await ApInvoice.insert(ApInvoice.castParam(3, 404));
//         console.log(test);

//         // in: ApInvoice
//         // out: rowCount
//         var test = await ApInvoice.update(ApInvoice.castParam(9, 404));
//         console.log(test);

//         // in: importinvoice_id (obj)
//         // out: rowCount
//         var test = await ApInvoice.delete({ importinvoice_id: 404 });
//         console.log(test);
//     })();
// }




module.exports = { ApInvoice, ApReport };