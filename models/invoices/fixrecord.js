const { SelectQuery, InsertQuery, ExactUpdateQuery, DeleteQuery } = require('../../utils/queryBuilder');

const FR_Table = {
    NAME: 'fix_record',
    fixrecord_id: 'fixrecord_id',
    car_plate: 'car_plate',
    date: 'date',
    total_price: 'total_price',
    status: 'status',
    pay: 'pay',
}

const FD_Table = {
    NAME: 'fix_detail',
    date: 'date',
    detail: 'detail',
    price: 'price',
    fixdetail_id: 'fixdetail_id',
    fixrecord_id: 'fixrecord_id',
    ap_id: 'ap_id',
    mec_id: 'mec_id',
    Status: 'Status',
    quantity: 'quantity',
}

class FixDetail {
    constructor() {
        this.date = null;
        this.detail = null;
        this.price = null;
        this.fixdetail_id = null;
        this.fixrecord_id = null;
        this.ap_id = null;
        this.mec_id = null;
        this.Status = null;
        this.quantity = null;
    }
    static castObj(obj) {
        const cast = new FixDetail();
        cast.date = obj.date;
        cast.detail = obj.detail;
        cast.price = obj.price;
        cast.fixdetail_id = obj.fixdetail_id;
        cast.fixrecord_id = obj.fixrecord_id;
        cast.ap_id = obj.ap_id;
        cast.mec_id = obj.mec_id;
        cast.Status = obj.Status;
        cast.quantity = obj.quantity;
        return cast;
    }
    static castParam(date, detail, price, fixdetail_id, fixrecord_id, ap_id, mec_id, Status, quantity) {
        const cast = new FixDetail();
        cast.date = date;
        cast.detail = detail;
        cast.price = price;
        cast.fixdetail_id = fixdetail_id;
        cast.fixrecord_id = fixrecord_id;
        cast.ap_id = ap_id;
        cast.mec_id = mec_id;
        cast.Status = Status;
        cast.quantity = quantity;
        return cast;
    }

    // read
    // get all
    static async getByFixRecord(fixrecord_id) {
        const data = await SelectQuery.init(FD_Table.NAME).setSelectAll().addEqualValue(FD_Table.fixrecord_id, fixrecord_id).execute();
        return data.map(d => FixDetail.castObj(d));
    }

    // cud
    static async insert(entity) {
        const res = await InsertQuery.init(FD_Table.NAME).default(entity, [FD_Table.fixdetail_id]).execute();
        return res;
    }
    static async update(entity) {
        const res = await ExactUpdateQuery.init(FD_Table.NAME).default(entity, [FD_Table.fixdetail_id]).execute();
        return res;
    }
    static async delete({ fixdetail_id }) {
        const res = await DeleteQuery.init(FD_Table.NAME).default({ fixdetail_id }).execute();
        return res;
    }
}

class FixRecord {
    constructor() {
        this.fixrecord_id = null;
        this.car_plate = null;
        this.date = null;
        this.total_price = null;
        this.status = null;
        this.pay = null;
    }
    static castObj(obj) {
        const cast = new FixRecord();
        cast.fixrecord_id = obj.fixrecord_id;
        cast.car_plate = obj.car_plate;
        cast.date = obj.date;
        cast.total_price = obj.total_price;
        cast.status = obj.status;
        cast.pay = obj.pay;
        return cast;
    }
    static castParam(fixrecord_id, car_plate, date, total_price, status, pay) {
        const cast = new FixRecord();
        cast.fixrecord_id = fixrecord_id;
        cast.car_plate = car_plate;
        cast.date = date;
        cast.total_price = total_price;
        cast.status = status;
        cast.pay = pay;
        return cast;
    }

    // read
    // get all
    static async getAll() {
        const data = await SelectQuery.init(FR_Table.NAME).setSelectAll().execute();
        return data.map(d => FixRecord.castObj(d));
    }
    static async getRecordsByPlate(car_plate) {
        const data = await SelectQuery.init(FR_Table.NAME).setSelectAll().addEqual(FR_Table.car_plate, car_plate).execute();
        return data.map(d => FixRecord.castObj(d));
    }
    static async getRecordById(fixrecord_id) {
        const data = await SelectQuery.init(FR_Table.NAME).setSelectAll().addEqualValue(FR_Table.fixrecord_id, fixrecord_id).execute('one');
        return FixRecord.castObj(data);
    }
    static async getRecordsByDate(start, end) {
        const data = await SelectQuery.init(FR_Table.NAME).setSelectAll().addBetweenDate(FR_Table.date, start, end).execute();
        return data.map(d => FixRecord.castObj(d));
    }
    static async getTotalPriceByDateByPay(start, end, pay) {
        const sq = SelectQuery.init(FR_Table.NAME + ' fr')
            .addJoin('fix_detail fd', 'fd.fixrecord_id = fr.fixrecord_id')
            .addJoin('auto_part ap', 'fd.ap_id = ap.ap_id')
            .setSelectCustom(['COALESCE(SUM(ap.price * fd.quantity + fd.price), 0) AS tp']);
        if (start != null && end != null) {
            sq.addBetweenDate('fr.date', start, end, 'alias');
        }
        if (pay != null) {
            sq.addEqual('fr.pay', pay, 'alias');
        }
        const data = await sq.execute('one');
        return data.tp;
    }
    static async getRecordsSearchPlate(car_plate_key) {
        const data = await SelectQuery.init(FR_Table.NAME).setSelectAll().addIlikeValue(FR_Table.car_plate, car_plate_key).execute();
        return data.map(d => FixRecord.castObj(d));
    }

    // cud
    static async insert(entity) {
        const res = await InsertQuery.init(FR_Table.NAME).default(entity, [FR_Table.fixrecord_id]).execute();
        return res;
    }
    static async update(entity) {
        const res = await ExactUpdateQuery.init(FR_Table.NAME).default(entity, [FR_Table.fixrecord_id]).execute();
        return res;
    }
    static async delete({ fixrecord_id }) {
        const res = await DeleteQuery.init(FR_Table.NAME).default({ fixrecord_id }).execute();
        return res;
    }
}


// >>>> =============================================
// Test
// <<<< =============================================

const fixDetailFlag = 0;
const fixRecordFlag = 0;
const micsFlag = 0;

if (fixDetailFlag) {
    (async () => {
        console.log(await FixDetail.getByFixRecord(7));
        console.log(await FixDetail.insert(FixDetail.castParam(new Date(), 'bla bla bla', 12000000, 0, 300, 14, 6, 'Fixed', 32)));
        console.log(await FixDetail.update(FixDetail.castParam(new Date(), 'adasd', 12000000, 0, 300, 14, 6, 'Fixed', 32)));
        console.log(await FixDetail.delete({ fixdetail_id: 0 }));
    })();
}

if (fixRecordFlag) {
    (async () => {
        console.log(await FixRecord.getAll());
        console.log(await FixRecord.getRecordsByPlate('63A1-88888'));
        console.log(await FixRecord.getRecordsByDate(new Date("2024/01/01"), new Date()));
        console.log(await FixRecord.getRecordById(7));
        console.log(await FixRecord.insert(FixRecord.castParam(6, '63A1-88888', new Date(), 0, 'Processing', true)));
        console.log(await FixRecord.update(FixRecord.castParam(6, '63A1-88888', new Date(), 0, 'Fixed', false)));
        console.log(await FixRecord.delete({ fixrecord_id: 6 }));
    })();
}

if (micsFlag) {
    (async () => {
        console.log(await FixRecord.getRecordsSearchPlate('88888'));
        console.log(await FixRecord.getTotalPriceByDateByPay(new Date('01/01/2024'), new Date(), null));
        console.log(await FixRecord.getTotalPriceByDateByPay(null, null, true));
        console.log(await FixRecord.getTotalPriceByDateByPay(new Date('01/01/2024'), new Date(), true));
    })();
}

module.exports = {
    FixDetail,
    FixRecord,
}