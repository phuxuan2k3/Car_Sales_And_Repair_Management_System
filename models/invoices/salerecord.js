const { SelectQuery, InsertQuery, ExactUpdateQuery, DeleteQuery } = require('../../utils/queryBuilder');

const SD_Table = {
    NAME: 'sale_detail',
    salerecord_id: 'salerecord_id', // PK FK
    car_id: 'car_id',               // PK
    quantity: 'quantity',
}

const SR_Table = {
    NAME: 'sale_record',
    salerecord_id: 'salerecord_id', // PK
    cus_id: 'cus_id',               // FK
    date: 'date',
    total_price: 'total_price',
}

class SaleDetail {
    constructor() {
        this.salerecord_id = null;
        this.car_id = null;
        this.quantity = null;
    }
    static castObj(obj) {
        const cast = new SaleDetail();
        cast.salerecord_id = obj.salerecord_id;
        cast.car_id = obj.car_id;
        cast.quantity = obj.quantity;
        return cast;
    }
    static castParam(salerecord_id, car_id, quantity) {
        const cast = new SaleDetail();
        cast.salerecord_id = salerecord_id;
        cast.car_id = car_id;
        cast.quantity = quantity;
        return cast;
    }

    // read
    // get all
    static async getBySaleRecord(salerecord_id) {
        const data = await SelectQuery.init(SD_Table.NAME).setSelectAll().addEqualValue(SD_Table.salerecord_id, salerecord_id).execute();
        return data.map(d => SaleDetail.castObj(d));
    }

    // cud
    static async insert(entity) {
        const res = await InsertQuery.init(SD_Table.NAME).default(entity, [SD_Table.salerecord_id, SD_Table.car_id]).execute();
        return res;
    }
    static async update(entity) {
        const res = await ExactUpdateQuery.init(SD_Table.NAME).default(entity, [SD_Table.salerecord_id, SD_Table.car_id]).execute();
        return res;
    }
    static async delete({ salerecord_id, car_id }) {
        const res = await DeleteQuery.init(SD_Table.NAME).default({ salerecord_id, car_id }).execute();
        return res;
    }
}

class SaleRecord {
    constructor() {
        this.salerecord_id = null;
        this.cus_id = null;
        this.date = null;
        this.total_price = null;
    }
    static castObj(obj) {
        const cast = new SaleRecord();
        cast.salerecord_id = obj.salerecord_id;
        cast.cus_id = obj.cus_id;
        cast.date = obj.date;
        cast.total_price = obj.total_price;
        return cast;
    }
    static castParam(salerecord_id, cus_id, date, total_price) {
        const cast = new SaleRecord();
        cast.salerecord_id = salerecord_id;
        cast.cus_id = cus_id;
        cast.date = date;
        cast.total_price = total_price;
        return cast;
    }

    // read
    // get all
    static async getAll() {
        const data = await SelectQuery.init(SR_Table.NAME).setSelectAll().execute();
        return data.map(d => SaleRecord.castObj(d));
    }
    static async getRecordsByCusId(cus_id) {
        const data = await SelectQuery.init(SR_Table.NAME).setSelectAll().addEqual(SR_Table.cus_id, cus_id).execute();
        return data.map(d => SaleRecord.castObj(d));
    }
    static async getRecordById(salerecord_id) {
        const data = await SelectQuery.init(SR_Table.NAME).setSelectAll().addEqualValue(SR_Table.salerecord_id, salerecord_id).execute('one');
        return SaleRecord.castObj(data);
    }
    static async getRecordsByDate(start, end) {
        const data = await SelectQuery.init(SR_Table.NAME).setSelectAll().addBetweenDate(SR_Table.date, start, end).execute();
        return data.map(d => SaleRecord.castObj(d));
    }

    // cud
    static async insert(entity) {
        const res = await InsertQuery.init(SR_Table.NAME).default(entity, [SR_Table.salerecord_id]).execute();
        return res;
    }
    static async update(entity) {
        const res = await ExactUpdateQuery.init(SR_Table.NAME).default(entity, [SR_Table.salerecord_id]).execute();
        return res;
    }
    static async delete({ salerecord_id }) {
        const res = await DeleteQuery.init(SR_Table.NAME).default({ salerecord_id }).execute();
        return res;
    }
}


// >>>> =============================================
// Test
// <<<< =============================================

const saleDetailFlag = 0;
const saleRecordFlag = 0;
const micsFlag = 1;

if (saleDetailFlag) {
    (async () => {
        console.log(await SaleDetail.getBySaleRecord(201));
        console.log(await SaleDetail.insert(SaleDetail.castParam(201, 4, 4)));
        console.log(await SaleDetail.update(SaleDetail.castParam(201, 4, 0)));
        console.log(await SaleDetail.delete({ salerecord_id: 201, car_id: 4 }));
    })();
}

if (saleRecordFlag) {
    (async () => {
        console.log(await SaleRecord.getAll());
        console.log(await SaleRecord.getRecordsByCusId(46));
        console.log(await SaleRecord.getRecordsByDate(new Date("2024/01/01"), new Date()));
        console.log(await SaleRecord.getRecordById(201));
        console.log(await SaleRecord.insert(SaleRecord.castParam(199, 42, new Date(), 0)));
        console.log(await SaleRecord.update(SaleRecord.castParam(199, 46, new Date(), 1000)));
        console.log(await SaleRecord.delete({ salerecord_id: 199 }));
    })();
}

if (micsFlag) {
    (async () => {
        // const insertedObjId = await SaleRecord.insert({ cus_id: 42, date: new Date() });
        const insertObj = SaleRecord.castParam(null, 42, new Date(), null);
        const insertedObjId = SaleRecord.castObj(await SaleRecord.insert(insertObj));
        console.log(insertedObjId.salerecord_id);
        console.log(await SaleRecord.update(SaleRecord.castParam(insertedObjId.salerecord_id, 46, new Date())));
        console.log(await SaleRecord.delete({ salerecord_id: insertedObjId.salerecord_id }));
    })();
}


module.exports = {
    SaleDetail,
    SaleRecord,
}