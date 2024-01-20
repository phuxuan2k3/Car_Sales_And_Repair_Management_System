const tryCatch = require('../../utils/tryCatch');
const { FixRecord, FixDetail } = require('../../models/invoices/fixrecord');
require('dotenv').config();

module.exports = {
    // >>>> =============================================
    // API
    // <<<< ============================================= 

    // require: query: car_plate
    // return: all record of a car_plate 
    getSaleRecordsByPlate: tryCatch(async (req, res) => {
        const car_plate = req.query.car_plate;
        const fixRecords = await FixRecord.getRecordsByPlate(car_plate);
        return res.json({ fixRecords });
    }),

    // require: query: fixrecord_id 
    // return: fixRecord (single), fixDetails of that record (array)
    getFullFixRecord: tryCatch(async (req, res) => {
        const fixrecord_id = req.query.fixrecord_id;
        const fixRecord = await FixRecord.getRecordById(fixrecord_id);
        const fixDetails = await FixDetail.getByFixRecord(fixrecord_id);
        return res.json({ fixRecord, fixDetails })
    }),

    // require: 
    // return: all fixRecords (no details)
    getAllFixRecords: tryCatch(async (req, res) => {
        const fixRecords = await FixRecord.getAll();
        return res.json({ fixRecords });
    }),

    // NOTE: add != insert, add is insert with less detail and more logic related
    // require: body: car_plate, date, status
    // return: fixrecord insert result
    addFixRecord: tryCatch(async (req, res) => {
        const car_plate = req.body.car_plate;
        const date = new Date(req.body.date);
        const status = req.body.status;
        const fixRecordData = FixRecord.castParam(null, car_plate, date, null, status);
        const result = FixRecord.castObj(await FixRecord.insert(fixRecordData));
        return res.json({ result });
    }),

    // require: body: fixrecord_id, date, detail, price, ap_id, mec_id, Status, quantity
    // return: fixdetail insert result
    addFixDetailToRecord: tryCatch(async (req, res) => {
        const { fixrecord_id, date, detail, price, ap_id, mec_id, Status, quantity } = req.body;
        date = new Date(date);
        price = parseFloat(price) || 0;
        const fixDetailData = FixDetail.castParam(date, detail, price, null, fixrecord_id, ap_id, mec_id, Status, quantity);
        const result = FixDetail.castObj(await FixDetail.insert(fixDetailData));
        return res.json({ result });
    }),

    // require: body: fixdetail_id, Status
    // return: fixdetail update result
    updateStatusOfFixDetail: tryCatch(async (req, res) => {
        const { fixdetail_id, Status } = req.body;
        const result = FixDetail.update({ fixdetail_id, Status });
        return res.json({ result });
    }),

    // require: body: fixdetail_id, detail
    // return: fixdetail update result
    updateDetailOfFixDetail: tryCatch(async (req, res) => {
        const { fixdetail_id, detail } = req.body;
        const result = FixDetail.update({ fixdetail_id, detail });
        return res.json({ result });
    }),

    // require: body: fixrecord_id, status
    // return: fixrecord update result
    updateStatusOfFixRecord: tryCatch(async (req, res) => {
        const { fixrecord_id, status } = req.body;
        const result = FixDetail.update({ fixrecord_id, status });
        return res.json({ result });
    }),

    // require: body: fixrecord_id, pay
    // return: fixrecord update result
    updatePayOfFixRecord: tryCatch(async (req, res) => {
        const { fixrecord_id, pay } = req.body;
        const result = FixRecord.update({ fixrecord_id, pay });
        return res.json({ result });
    }),
}