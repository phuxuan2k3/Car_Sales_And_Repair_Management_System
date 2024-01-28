const dbExecute = require('../utils/dbExecute');
const tableName = 'car';

module.exports = class Car {
    constructor(obj) {
        this.id = obj.id;
        this.car_name = obj.car_name;
        this.brand = obj.brand;
        this.type = obj.type;
        this.year = obj.year;
        this.price = obj.price;
        this.description = obj.description;
        this.quantity = obj.quantity;
    }
    static async getAll() {
        const data = await dbExecute.getAll(tableName);
        return data.map(c => { return new Car(c) });
    }
    static async getCustom(limit, offset) {
        const data = await dbExecute.getCustom(limit, offset, tableName);
        return data.map(c => { return new Car(c) });
    }
    static async insert(entity, smid) {
        const query = `SELECT * FROM "add_newcar"('${entity.car_name}', 
        '${entity.brand}',
        '${entity.type}',
        ${entity.year},
        ${entity.price},
        '${entity.description}',
        ${entity.quantity},
        ${smid});`;
        return await dbExecute.customQuery(query);
    }
    static async update(id, entity, smid) {
        const query = `SELECT * FROM "update_car"('${entity.car_name}', 
        '${entity.brand}',
        '${entity.type}',
        ${entity.year},
        ${entity.price},
        '${entity.description}',
        ${id},
        ${entity.add},
        ${smid});`;
        return await dbExecute.customQuery(query);
    }
    static async updateQuanTity(id, quantity) {
        let entity = await dbExecute.getById(id, tableName);
        entity.quantity = quantity;
        delete entity.id;
        return await dbExecute.update(id, entity, tableName);
    }
    static async delete(id) {
        return await dbExecute.delete(id, tableName);
    }
    static async getAllBrand() {
        let query = `select distinct "brand" from "${tableName}"`
        return await dbExecute.customQuery(query);
    }
    static async getAllType() {
        let query = `select distinct "type" from "${tableName}"`
        return await dbExecute.customQuery(query);
    }
    static async getCarById(id) {
        const data = await dbExecute.getById(id, tableName);
        return new Car(data)
    }
    static async getCarByName(name) {
        const query = `select* from ${tableName} where car_name ilike '%${name}%'`
        return await dbExecute.customQuery(query);
    }
    static async getMaxPrice() {
        const query = `select max(price) from ${tableName};`;
        return await dbExecute.customQuery(query);
    }
    static async countRecord() {
        const query = `select count(*) from ${tableName}`
        return (await dbExecute.customQuery(query))[0];
    }
    static async count() {
        const query = `select sum(quantity) from ${tableName}`
        return (await dbExecute.customQuery(query))[0];
    }
    static async getCarPage(years, searchStr, brands, types, maxPrice, limit, offset) {
        let query = `select * from "${tableName}"`
        let brandQuery;
        let typeQuery;
        let yearQuery;
        let searchQuery;
        let filterArr = [];
        let brandFilter = [];
        let yearFilter = [];
        let typeFilter = [];
        if (brands != undefined) {
            for (const brand of brands) {
                brandFilter.push(`"brand"='${brand}'`)
            }
            brandQuery = brandFilter.join(' or ');
            brandQuery = `( ${brandQuery} )`
            filterArr.push(brandQuery);
        }
        if (types != undefined) {
            for (const type of types) {
                typeFilter.push(`"type"='${type}'`)
            }
            typeQuery = typeFilter.join(' or ');
            typeQuery = `( ${typeQuery} )`
            filterArr.push(typeQuery);
        }
        if (years != undefined) {
            for (const year of years) {
                yearFilter.push(`"year"=${year}`)
            }
            yearQuery = yearFilter.join(' or ');
            yearQuery = `( ${yearQuery} )`;
            filterArr.push(yearQuery);
        }
        if (searchStr != undefined) {
            searchQuery = `( "car_name" ilike '%${searchStr}%' )`;
            filterArr.push(searchQuery);
        }
        if (maxPrice != undefined) filterArr.push(`"price" <= ${maxPrice}`)
        let filterString = filterArr.join(' and ');
        if (filterArr.length != 0) query += ' where ' + filterString;
        const totalPage = Math.ceil((await dbExecute.customQuery(query)).length / limit);
        query += ` order by "id" offset ${offset} limit ${limit}`;
        const data = await dbExecute.customQuery(query);
        const carData = data.map(c => { return new Car(c) });
        return {
            totalPage: totalPage,
            data: carData,
        }
    }
    static async getMostCar() {
        let query = `SELECT * FROM ${tableName} ORDER BY quantity DESC LIMIT 1;`
        return (await dbExecute.customQuery(query))[0];
    }
    static async getAllYear() {
        let query = `SELECT DISTINCT "year" from ${tableName} ORDER BY "year"`
        return (await dbExecute.customQuery(query));
    }
    static async getCarByStyle(type) {
        let query = `select * from "${tableName}" where "type"='${type}'`;
        return (await dbExecute.customQuery(query));
    }
}