const dbExecute = require('../utils/dbExecute');
const { pgp } = require('../config/configDatabase');
const queryHelper = pgp.helpers;
const tableName = 'cart';

module.exports = class Cart {
    constructor(obj) {
        this.customer_ID = obj.customer_ID;
        this.car_ID = obj.car_ID;
        this.quantity = obj.quantity;
    }
    static async getCartByCusID(id) {
        const query = `select * from "${tableName}" where "customer_ID"=${id} order by "car_ID"`;
        const data = await dbExecute.customQuery(query);
        return data.map(e => { return new Cart(e) });
    }
    static async insert(entity) {
        let query = queryHelper.insert(entity,null,tableName);
        query += ` returning "car_ID", "customer_ID" `
        const data = await dbExecute.customQuery(query);
        return data;
    }
    static async getCarInCart(cusId, carId) {
        const query = `select * from "${tableName}" where "car_ID"=${carId} and "customer_ID"=${cusId} `
        const data = await dbExecute.customQuery(query);
        return data.map(e => { return new Cart(e) });
    }
    static async updateCarQuanTityInCart(cusId, carId, newQuantity) {
        const query = `UPDATE "${tableName}"
                        SET  "quantity"=${newQuantity}
                        WHERE "car_ID"=${carId} and "customer_ID"=${cusId};`
        
        return await dbExecute.customQuery(query);
    }
    static async deleteCartItem(cusId, carId) {
        const query = `DELETE FROM "${tableName}"
                        WHERE "car_ID"=${carId} and "customer_ID"=${cusId};`
        return await dbExecute.customQuery(query);
    }
}
