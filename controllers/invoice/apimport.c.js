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

    // require: body: importinvoice_id, sm_id, total_price (can be null)
    // return: result
    addApInvoice: tryCatch(async (req, res) => {
        const ai = ApInvoice.castObj(req.body);
        const result = ApInvoice.castObj(await ApInvoice.insert(ai));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, sm_id, total_price (can be null)
    // return: result
    updateApInvoice: tryCatch(async (req, res) => {
        const ai = ApInvoice.castObj(req.body);
        const result = ApInvoice.castObj(await ApInvoice.update(ai));
        return res.json({ result });
    }),

    // require: body: importinvoice_id
    // return: result
    deleteApInvoice: tryCatch(async (req, res) => {
        const { importinvoice_id } = (req.body);
        const result = ApInvoice.castObj(await ApInvoice.delete({ importinvoice_id }));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, ap_id, quantity, date (can be null)
    // return: result
    addApReportToInvoice: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const ar = ApReport.castParam(importinvoice_id, ap_id, quantity, date);
        const result = ApReport.castObj(await ApReport.insert(ar));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, ap_id, quantity, date (can be null)
    // return: result
    updateApReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const quantity = req.body.quantity;
        const date = req.body.date;
        const ar = ApReport.castParam(importinvoice_id, ap_id, quantity, date);
        const result = ApReport.castObj(await ApReport.update(ar));
        return res.json({ result });
    }),

    // require: body: importinvoice_id, ap_id (can be null)
    // return: result
    deleteApReport: tryCatch(async (req, res) => {
        const importinvoice_id = req.body.importinvoice_id;
        const ap_id = req.body.ap_id;
        const result = ApReport.castObj(await ApReport.delete({ importinvoice_id, ap_id }));
        return res.json({ result });
    }),
}