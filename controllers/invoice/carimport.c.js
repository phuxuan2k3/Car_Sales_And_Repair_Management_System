const tryCatch = require('../../utils/tryCatch');
const { CarReport, CarInvoice } = require('../../models/invoices/carimport');
require('dotenv').config();

module.exports = {
    // >>>> =============================================
    // API
    // <<<< ============================================= 

    // require: query: importinvoice_id
    // return: all report of an invoice 
    getCarReportsOfInvoice: tryCatch(async (req, res) => {
        const importinvoice_id = req.query.importinvoice_id;
        const data = await CarReport.getReports(importinvoice_id);
        return res.json(data);
    }),

    // require: body: importinvoice_id, car_id, quantity, date
    // return: importinvoice_id, car_id of newly inserted object
    insertCarReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const car_id = req.body.car_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const cr = CarReport.castParam(importinvoice_id, car_id, quantity, date);
        const data = await CarReport.insert(cr);
        return res.json(data);
    }),

    // require: body: importinvoice_id, car_id, quantity, date
    // return: rows affected (1 or 0)
    updateCarReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const car_id = req.body.car_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const cr = CarReport.castParam(importinvoice_id, car_id, quantity, date);
        const data = await CarReport.update(importinvoice_id, car_id, cr);
        return res.json(data);
    }),

    // require: body: importinvoice_id, car_id
    // return: rows affected (1 or 0)
    deleteCarReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const car_id = req.body.car_id;
        const data = await CarReport.delete({ importinvoice_id, car_id });
        return res.json(data);
    }),

    // require:
    // return: all invoices
    getAllInvoices: tryCatch(async (req, res) => {
        const data = await CarInvoice.getAll();
        return res.json(data)
    }),

    // require: query: sm_id
    // return: invoices of a store manager
    getInvoicesByStoreManager: tryCatch(async (req, res) => {
        const sm_id = req.query.sm_id;
        const data = await CarInvoice.getByStoreManager(sm_id);
        return res.json(data);
    }),
}