const { SelectQuery, InsertQuery, ExactUpdateQuery, DeleteQuery, execute } = require('../../utils/queryBuilder');

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
    static async getTotalPriceByDateByCus(start, end, cus_id) {
        const sq = SelectQuery.init(SR_Table.NAME)
            .setSelectCustom(['COALESCE(SUM(total_price), 0) AS tp']);
        if (start != null && end != null) {
            sq.addBetweenDate('date', start, end, 'alias');
        }
        if (cus_id != null) {
            sq.addEqual('cus_id', cus_id);
        }
        const data = await sq.execute('one');
        return data.tp;
    }
    static async getTotalPriceByNearestDateChunk(type, limit) {
        // const query = `
        // SELECT DATE_TRUNC('${type}', "date") as start_date, ROUND(SUM(total_price)::numeric,2) as total_price
        // FROM sale_record
        // GROUP BY DATE_TRUNC('${type}', "date")
        // HAVING DATE_TRUNC('${type}', "date") IS NOT NULL
        // ORDER BY start_date DESC
        // LIMIT ${limit}
        // `;
        const query = `
        with
        date_chunk as (
            select dt::date sd, (dt + interval '1 ${type}')::date ed
            from generate_series(current_date - interval '${limit - 1} ${type}', current_date, interval '1 ${type}') dt
        ),
        data_by_day as (
            SELECT DATE_TRUNC('day', "date")::date d, ROUND(SUM(total_price)::numeric, 2) total_price
            FROM sale_record
            GROUP BY DATE_TRUNC('day', "date")
            HAVING DATE_TRUNC('day', "date") IS NOT NULL
        )
        select dc.sd::text start_date, dc.ed::text end_date, sum(COALESCE(total_price, 0)) total_price
        from data_by_day dbd right join date_chunk dc
        on dbd.d >= dc.sd and dbd.d < dc.ed
        group by dc.sd, dc.ed
        order by end_date asc
        `;
        const data = await execute(query);
        // console.log(data);
        // console.log(query);
        const start_date = data.map(d => d.start_date);
        const total_price = data.map(d => d.total_price);
        return { start_date, total_price };
    }
    static async getTopByQuantity(limit) {
        const query = `
        SELECT sd.car_id as id, car.car_name as name, SUM(sd.quantity) as total_quantity
        FROM sale_detail sd JOIN car ON car.id = sd.car_id
        GROUP BY sd.car_id, car.car_name
        ORDER BY total_quantity DESC
        LIMIT ${limit}
        `;
        const data = await execute(query);
        const id = data.map(d => d.id);
        const name = data.map(d => d.name);
        const total_quantity = data.map(d => d.total_quantity);
        const queryAll = `
        SELECT SUM(sale_detail.quantity) as all_total
        FROM sale_detail
        `;
        const dataAll = await execute(queryAll, 'one');
        const queryRest = `
        SELECT SUM(tq) as rest_total FROM (
            SELECT SUM(sd.quantity) as tq
            FROM sale_detail sd
            GROUP BY sd.car_id
            ORDER BY tq DESC
            OFFSET ${limit}
        )
        `;
        const dataRest = await execute(queryRest, 'one');
        return { id, name, total_quantity, all_total: dataAll.all_total, rest_total: dataRest.rest_total };
    }
    // bonus
    static async getTopByPrice(limit) {
        const query = `
        SELECT sd.car_id as id, car.car_name as name, SUM(sd.quantity * car.price) as total_price
        FROM sale_detail sd JOIN car ON car.id = sd.car_id
        GROUP BY sd.car_id, car.car_name
        ORDER BY total_price DESC
        LIMIT ${limit}
        `;
        const data = await execute(query);
        const id = data.map(d => d.id);
        const name = data.map(d => d.name);
        const total_price = data.map(d => d.total_price);
        const queryAll = `
        SELECT SUM(sd.quantity * car.price) as all_total
        FROM sale_detail sd JOIN car ON car.id = sd.car_id
        `;
        const dataAll = await execute(queryAll, 'one');
        const queryRest = `
        SELECT SUM(tp) as rest_total FROM (
            SELECT SUM(sd.quantity * car.price) as tp
            FROM sale_detail sd JOIN car ON car.id = sd.car_id
            GROUP BY sd.car_id
            ORDER BY tp DESC
            OFFSET ${limit}
        )
        `;
        const dataRest = await execute(queryRest, 'one');
        return { id, name, total_price, all_total: dataAll.all_total, rest_total: dataRest.rest_total };
    }
    static async getJoinWithCustomer() {
        const data = await SelectQuery.init(`${SR_Table.NAME} sr`)
            .setSelectAll()
            .addJoin('user_info u', 'u.id = sr.cus_id')
            .execute();
        return data;
    }
    static async getJoinWithCustomerById(id) {
        const data = await SelectQuery.init(`${SR_Table.NAME} sr`)
            .setSelectAll()
            .addEqual('salerecord_id', id)
            .addJoin('user_info u', 'u.id = sr.cus_id')
            .execute('one');
        return data;
    }
    static async getAllDetailFull(salerecord_id) {
        const data = await SelectQuery.init(`sale_detail sd`)
            .setSelectCustom(['sd.quantity as quantity', 'c.car_name as car_name'])
            .addJoin('car c', 'sd.car_id = c.id')
            .addEqual('sd.salerecord_id', salerecord_id, 'alias')
            .execute();

        return data;
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

const fullInvoiceFlag = 0;
if (fullInvoiceFlag) {
    (async () => {
        console.log(await SaleRecord.getJoinWithCustomer());
        console.log(await SaleRecord.getAllDetailFull(201));
    })();
}


const statisticDateChunkFlag = 0;
if (statisticDateChunkFlag) {
    (async () => {
        console.log(await SaleRecord.getTotalPriceByNearestDateChunk('day', 10));
        console.log(await SaleRecord.getTotalPriceByNearestDateChunk('week', 10));
        console.log(await SaleRecord.getTotalPriceByNearestDateChunk('month', 10));
        console.log(await SaleRecord.getTotalPriceByNearestDateChunk('year', 10));
    })();
}

const statisticRatioFlag = 0;
if (statisticRatioFlag) {
    (async () => {
        console.log(await SaleRecord.getTopByQuantity(5));
        console.log(await SaleRecord.getTopByQuantity(10));
        console.log(await SaleRecord.getTopByPrice(5));
        console.log(await SaleRecord.getTopByPrice(10));
    })();
}


// if (saleDetailFlag) {
//     (async () => {
//         console.log(await SaleDetail.getBySaleRecord(201));
//         console.log(await SaleDetail.insert(SaleDetail.castParam(201, 4, 4)));
//         console.log(await SaleDetail.update(SaleDetail.castParam(201, 4, 0)));
//         console.log(await SaleDetail.delete({ salerecord_id: 201, car_id: 4 }));
//     })();
// }

// if (saleRecordFlag) {
//     (async () => {
//         console.log(await SaleRecord.getAll());
//         console.log(await SaleRecord.getRecordsByCusId(46));
//         console.log(await SaleRecord.getRecordsByDate(new Date("2024/01/01"), new Date()));
//         console.log(await SaleRecord.getRecordById(201));
//         console.log(await SaleRecord.insert(SaleRecord.castParam(199, 42, new Date(), 0)));
//         console.log(await SaleRecord.update(SaleRecord.castParam(199, 46, new Date(), 1000)));
//         console.log(await SaleRecord.delete({ salerecord_id: 199 }));
//     })();
// }

let insertNullFlag = 0;
let statisticFlag = 0;

if (insertNullFlag) {
    (async () => {
        // const insertedObjId = await SaleRecord.insert({ cus_id: 42, date: new Date() });
        const insertObj = SaleRecord.castParam(null, 42, new Date(), null);
        const insertedObjId = SaleRecord.castObj(await SaleRecord.insert(insertObj));
        console.log(insertedObjId.salerecord_id);
        console.log(await SaleRecord.update(SaleRecord.castParam(insertedObjId.salerecord_id, 46, new Date())));
        console.log(await SaleRecord.delete({ salerecord_id: insertedObjId.salerecord_id }));
    })();
}

if (statisticFlag) {
    (async () => {
        console.log(await SaleRecord.getTotalPriceByDateByCus(new Date("01/01/2024"), new Date(), null));
        console.log(await SaleRecord.getTotalPriceByDateByCus(null, null, 46));
        console.log(await SaleRecord.getTotalPriceByDateByCus(new Date("01/01/2024"), new Date(), 46));
    })();
}

module.exports = {
    SaleDetail,
    SaleRecord,
}