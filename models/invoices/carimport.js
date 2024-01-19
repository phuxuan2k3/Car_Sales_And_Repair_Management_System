const { SelectQuery, InsertQuery, ExactUpdateQuery, DeleteQuery } = require('../../utils/queryBuilder');

const CIR_Table = {
    NAME: 'car_import_report',
    importinvoice_id: 'importinvoice_id',
    car_id: 'car_id',
    quantity: 'quantity',
    date: 'date',
}

const CII_Table = {
    NAME: 'car_import_invoice',
    importinvoice_id: 'importinvoice_id',
    sm_id: 'sm_id',
}


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

    // read
    // get cars from a invoice
    static async getReportsFromInvoice(importinvoice_id) {
        const data = await SelectQuery.init(CIR_Table.NAME).setSelectAll().addEqual(CIR_Table.importinvoice_id, importinvoice_id).execute();
        return data.map(d => { return CarReport.castObj(d) });
    }
    // get all reports from date range
    static async getReportsByDate(start, end) {
        const data = await SelectQuery.init(CIR_Table.NAME).setSelectAll().addBetweenDate(CIR_Table.date, start, end).execute();
        return data.map(d => { return CarReport.castObj(d) });
    }
    // static async getTotalPriceByDate(start, end) {
    //     const data = await SelectQuery.init(CIR_Table.NAME).setSelectCustom(['SUM()']).addBetweenDate(CIR_Table.date, start, end).execute();
    //     return data.map(d => { return CarReport.castObj(d) });
    // }

    // cud
    // return importinvoice_id, car_id
    static async insert(entity) {
        const res = await InsertQuery.init(CIR_Table.NAME).default(entity, [CIR_Table.importinvoice_id, CIR_Table.car_id]).execute();
        return res;
    }
    // return rows affected
    static async update(entity) {
        const res = await ExactUpdateQuery.init(CIR_Table.NAME).default(entity, [CIR_Table.importinvoice_id, CIR_Table.car_id]).execute();
        return res;
    }
    // return rows affected
    static async delete({ importinvoice_id, car_id }) {
        const res = await DeleteQuery.init(CIR_Table.NAME).default({ importinvoice_id, car_id }).execute();
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
        const data = await SelectQuery.init(CII_Table.NAME).setSelectAll().execute();
        return data.map(d => CarInvoice.castObj(d));
    }
    // get all car invoices by page, by store manager, NOT-TEST
    static async getByStoreManager(sm_id) {
        const data = await SelectQuery.init(CII_Table.NAME).setSelectAll().addEqual(CII_Table.sm_id, sm_id).execute();
        return data.map(d => CarInvoice.castObj(d));
    }

    // cud
    // return importinvoice_id
    static async insert(entity) {
        const res = await InsertQuery.init(CII_Table.NAME).default(entity, [CII_Table.importinvoice_id]).execute();
        return res;
    }
    // return rows affected
    static async update(entity) {
        const res = await ExactUpdateQuery.init(CII_Table.NAME).default(entity, [CII_Table.importinvoice_id]).execute();
        return res;
    }
    // return rows affected
    static async delete({ importinvoice_id }) {
        const res = await DeleteQuery.init(CII_Table.NAME).default({ importinvoice_id }).execute();
        return res;
    }
}

// >>>> =============================================
// Test || set flag to 1 for testing
// <<<< =============================================

const flagReport = 1;
const flagInvoice = 0;

// Car Report
if (flagReport) {
    (async () => {
        // in: invoice id
        // out: Array of CarReport
        var test = await CarReport.getReportsFromInvoice(300);
        console.log(test);

        // in: start, end date
        // out: Array of CarReport
        var test = await CarReport.getReportsByDate(new Date("2024/01/01"), new Date());
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
if (flagInvoice) {
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