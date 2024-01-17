const { ApInvoice, ApReport } = require('./apinvoice');
const { CarReport, CarInvoice } = require('./carinvoice');

// 0 - passed
// 1 - testing

// Car Report
if (0) {
    (async () => {
        // in: invoice id
        // out: Array of CarReport
        var test = await CarReport.getCarReports(300);
        console.log(test);

        // in: CarReport obj
        // out: {importinvoice_id, car_id}
        var test = CarReport.castParam(299, 12, 5, new Date());
        var res = await CarReport.insert(test);
        console.log(res);

        // in: invoice id, car id (primary keys), CarReport obj
        // out: rowCount
        var test = await CarReport.update(299, 12, CarReport.castParam(299, 12, 0, new Date()));
        console.log(test);

        // in: invoice id, car id (primary keys)
        // out: rowCount
        var test = await CarReport.delete(299, 12);
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

        // in: limit, offset
        // out: Array of Invoices
        var test = await CarInvoice.getCustom(10, 0);
        console.log(test);

        // in: sm_id (store manager id)
        // out: Array of Invoices
        var test = await CarInvoice.getByStoreManager(3);
        console.log(test);

        // in: CarInvoice
        // out: {importinvoice_id}
        var test = await CarInvoice.insert(CarInvoice.castParam(3, 404));
        console.log(test);

        // in: importinvoice_id, CarInvoice
        // out: rowCount
        var test = await CarInvoice.update(404, CarInvoice.castParam(9, 404));
        console.log(test);

        // in: importinvoice_id
        // out: rowCount
        var test = await CarInvoice.delete(404);
        console.log(test);
    })();
}

// repeat for Auto-part (same structure)

// Ap Report
if (0) {
    (async () => {
        // in: invoice id
        // out: Array of ApReport
        var test = await ApReport.getApReports(300);
        console.log(test);

        // in: ApReport obj
        // out: {importinvoice_id, car_id}
        var test = ApReport.castParam(299, 18, 5, new Date());
        var res = await ApReport.insert(test);
        console.log(res);

        // in: invoice id, car id (primary keys), CarReport obj
        // out: rowCount
        var test = await ApReport.update(299, 18, ApReport.castParam(299, 18, 0, new Date()));
        console.log(test);

        // in: invoice id, car id (primary keys)
        // out: rowCount
        var test = await ApReport.delete(299, 18);
        console.log(test);
    })();
}

// Ap Invoice
if (1) {
    (async () => {
        // in:
        // out: Array of Invoices
        var test = await ApInvoice.getAll();
        console.log(test);
        console.log(test[0]);

        // in: limit, offset
        // out: Array of Invoices
        var test = await ApInvoice.getCustom(10, 0);
        console.log(test);

        // in: sm_id (store manager id)
        // out: Array of Invoices
        var test = await ApInvoice.getByStoreManager(3);
        console.log(test);

        // in: ApInvoice
        // out: {importinvoice_id}
        var test = await ApInvoice.insert(ApInvoice.castParam(3, 404));
        console.log(test);

        // in: importinvoice_id, ApInvoice
        // out: rowCount
        var test = await ApInvoice.update(404, ApInvoice.castParam(9, 404));
        console.log(test);

        // in: importinvoice_id
        // out: rowCount
        var test = await ApInvoice.delete(404);
        console.log(test);
    })();
}
