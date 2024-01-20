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
        const apReports = await ApReport.getReportsFromInvoice(importinvoice_id);
        return res.json({ apReports });
    }),

    // require:
    // return: all invoices
    getAllInvoices: tryCatch(async (req, res) => {
        const apInvoices = await ApInvoice.getAll();
        return res.json({ apInvoices })
    }),

    // require: query: sm_id
    // return: invoices of a store manager
    getInvoicesByStoreManager: tryCatch(async (req, res) => {
        const sm_id = req.query.sm_id;
        const apInvoices = await ApInvoice.getByStoreManager(sm_id);
        return res.json({ apInvoices });
    }),

    // require: body: importinvoice_id, ap_id, quantity, date
    // return: importinvoice_id, ap_id of newly inserted object
    addApReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const ar = ApReport.castParam(importinvoice_id, ap_id, quantity, date);
        const result = ApReport.castObj(await ApReport.insert(ar));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, ap_id, quantity, date
    // return: rows affected (1 or 0)
    updateApReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const ar = ApReport.castParam(importinvoice_id, ap_id, quantity, date);
        const result = ApReport.castObj(await ApReport.update(ar));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, ap_id
    // return: rows affected (1 or 0)
    deleteApReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const result = ApReport.castObj(await ApReport.delete({ importinvoice_id, ap_id }));
        return res.json({ result });
    }),
}