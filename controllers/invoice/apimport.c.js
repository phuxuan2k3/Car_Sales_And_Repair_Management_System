const tryCatch = require('../../utils/tryCatch');
const { ApReport, ApInvoice } = require('../../models/invoices/apimport');
require('dotenv').config();

module.exports = {
    // >>>> =============================================
    // API
    // <<<< ============================================= 

    // require: query: importinvoice_id
    // return: all report of an invoice 
    getApReportsOfInvoice: tryCatch(async (req, res) => {
        const importinvoice_id = req.query.importinvoice_id;
        const data = await ApReport.getReports(importinvoice_id);
        return res.json(data);
    }),

    // require: body: importinvoice_id, ap_id, quantity, date
    // return: importinvoice_id, ap_id of newly inserted object
    insertApReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const cr = ApReport.castParam(importinvoice_id, ap_id, quantity, date);
        const data = await ApReport.insert(cr);
        return res.json(data);
    }),

    // require: body: importinvoice_id, ap_id, quantity, date
    // return: rows affected (1 or 0)
    updateApReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const cr = ApReport.castParam(importinvoice_id, ap_id, quantity, date);
        const data = await ApReport.update(importinvoice_id, ap_id, cr);
        return res.json(data);
    }),

    // require: body: importinvoice_id, ap_id
    // return: rows affected (1 or 0)
    deleteApReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const data = await ApReport.delete({ importinvoice_id, ap_id });
        return res.json(data);
    }),

    // require:
    // return: all invoices
    getAllInvoices: tryCatch(async (req, res) => {
        const data = await ApInvoice.getAll();
        return res.json(data)
    }),

    // require: query: sm_id
    // return: invoices of a store manager
    getInvoicesByStoreManager: tryCatch(async (req, res) => {
        const sm_id = req.query.sm_id;
        const data = await ApInvoice.getByStoreManager(sm_id);
        return res.json(data);
    }),
}