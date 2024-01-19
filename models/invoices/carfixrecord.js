const { SelectQuery, InsertQuery, ExactUpdateQuery, DeleteQuery } = require('../../utils/queryBuilder');

const FR_Table = {
    NAME: 'fix_record',
    fixrecord_id: 'fixrecord_id',
    car_plate: 'car_plate',
    date: 'date',
    total_price: 'total_price',
    status: 'status',
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

class FixRecord {
    constructor() {
        this.fixdetail_id = null;
        this.car_plate = null;
        this.date = null;
        this.total_price = null;
        this.status = null;
    }
    static castObj(obj) {
        this.fixdetail_id = obj.fixdetail_id;
        this.car_plate = obj.car_plate;
        this.date = obj.date;
        this.total_price = obj.total_price;
        this.status = obj.status;
    }
    static castParam(fixdetail_id, car_plate, date, total_price, status) {
        this.fixdetail_id = fixdetail_id;
        this.car_plate = car_plate;
        this.date = date;
        this.total_price = total_price;
        this.status = status;
    }

    // read
    // get all
    static async getAll() {
        const data = await SelectQuery.init(FR_Table.NAME).setSelectAll().execute();
        return data.map(d => FixRecord.castObj(d));
    }
}