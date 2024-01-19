const tryCatch = require('../../utils/tryCatch');
const { CarReport, CarInvoice } = require('../../models/invoices/carimport');
require('dotenv').config();
const ENV = process.env;

module.exports = {
    // >>>> =============================================
    // API
    // <<<< ============================================= 

    // require: query: importinvoice_id
    // return: all report of an invoice 
    getCarReportsOfInvoice: tryCatch(async (req, res) => {
        const importinvoice_id = req.query.importinvoice_id;
        const data = await CarReport.getCarReports(importinvoice_id);
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
    updateCarReports: tryCatch(async (req, res) => {
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
    deleteCarReports: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const car_id = req.body.car_id;
        const data = await CarReport.delete(importinvoice_id, car_id);
        return res.json(data);
    }),

    // require:
    // return: all invoices
    getAllInvoices: tryCatch(async (req, res) => {
        const data = await CarInvoice.getAll();
        res.json(data)
    }),

    // require: query: page, per_page
    // return: invoices within page
    getInvoicesByPage: tryCatch(async (req, res) => {
        const page = parseInt(req.query.page);
        const perPage = parseInt(req.query.per_page);
        const data = await CarInvoice.getCustom();
        res.json(data);
    }),
}