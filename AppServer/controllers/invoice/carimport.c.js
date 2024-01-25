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
        const carReports = await CarReport.getReportsFromInvoice(importinvoice_id);
        return res.json({ carReports });
    }),

    // require:
    // return: all invoices
    getAllInvoices: tryCatch(async (req, res) => {
        const carInvoices = await CarInvoice.getAll();
        return res.json({ carInvoices });
    }),

    // require: query: sm_id
    // return: invoices of a store manager
    getInvoicesByStoreManager: tryCatch(async (req, res) => {
        const sm_id = req.query.sm_id;
        const carInvoices = await CarInvoice.getByStoreManager(sm_id);
        return res.json({ carInvoices });
    }),

    // require: body: importinvoice_id, sm_id, total_price (can be null)
    // return: result
    addCarInvoice: tryCatch(async (req, res) => {
        const ci = CarInvoice.castObj(req.body);
        const result = CarInvoice.castObj(await CarInvoice.insert(ci));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, sm_id, total_price (can be null)
    // return: result
    updateCarInvoice: tryCatch(async (req, res) => {
        const ci = CarInvoice.castObj(req.body);
        const result = CarInvoice.castObj(await CarInvoice.update(ci));
        return res.json({ result });
    }),

    // require: body: importinvoice_id
    // return: result
    deleteCarInvoice: tryCatch(async (req, res) => {
        const { importinvoice_id } = (req.body);
        const result = CarInvoice.castObj(await CarInvoice.delete({ importinvoice_id }));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, car_id, quantity, date (can be null)
    // return: result
    addCarReportToInvoice: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const car_id = req.body.car_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const cr = CarReport.castParam(importinvoice_id, car_id, quantity, date);
        const result = CarReport.castObj(await CarReport.insert(cr));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, car_id, quantity, date (can be null)
    // return: result
    updateCarReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const car_id = req.body.car_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const cr = CarReport.castParam(importinvoice_id, car_id, quantity, date);
        const result = CarReport.castObj(await CarReport.update(cr));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, car_id (can be null)
    // return: result
    deleteCarReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const car_id = req.body.car_id;
        const result = CarReport.castObj(await CarReport.delete({ importinvoice_id, car_id }));
        return res.json({ result });
    }),
}