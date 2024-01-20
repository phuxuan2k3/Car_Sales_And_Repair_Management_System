const tryCatch = require('../../utils/tryCatch');
const { SaleRecord, SaleDetail } = require('../../models/invoices/carsalerecord');
require('dotenv').config();

module.exports = {
    // >>>> =============================================
    // API
    // <<<< ============================================= 

    // require: body: cus_id
    // return: all record of a customer 
    getSaleRecordsByCusId: tryCatch(async (req, res) => {
        const cus_id = req.body.cus_id;
        const saleRecords = await SaleRecord.getRecordsByCusId(cus_id);
        return res.json({ saleRecords });
    }),

    // NOTE: add != insert, add is insert with less detail and more logic related
    // require: body: cus_id, date, car_id_quantity_array ([car_id, quantity])
    // return: salerecord and saledetails (array) insert result
    addSaleRecordAndDetails: tryCatch(async (req, res) => {
        const cus_id = req.body.cus_id;
        const date = new Date(req.body.date);
        const saleRecordData = SaleRecord.castParam(null, cus_id, date, null);
        const insertResultSaleRecord = SaleRecord.castObj(await SaleRecord.insert(saleRecordData));
        const car_id_quantity_array = req.body.car_id_quantity_array;
        const insertResultSaleDetailArray = [];
        for (const detail of car_id_quantity_array) {
            const saleDetail = SaleDetail.castParam(insertResultSaleRecord.salerecord_id, detail.car_id, detail.quantity);
            const insertResultSaleDetail = SaleDetail.castObj(await SaleDetail.insert(saleDetail));
            insertResultSaleDetailArray.push({ insertResultSaleDetail });
        }
        return res.json({ insertResultSaleRecord, insertResultSaleDetailArray });
    }),

    // require: body: salerecord_id 
    // return: saleRecord (single), saleDetails of that record (array)
    getFullSaleRecord: tryCatch(async (req, res) => {
        const salerecord_id = req.body.salerecord_id;
        const saleRecord = await SaleRecord.getRecordById(salerecord_id);
        const saleDetails = await SaleDetail.getBySaleRecord(salerecord_id);
        return res.json({ saleRecord, saleDetails })
    }),

    // require:
    // return: all saleRecords (no details)
    getAllSaleRecords: tryCatch(async (req, res) => {
        const saleRecords = await SaleRecord.getAll();
        return res.json({ saleRecords });
    }),
}