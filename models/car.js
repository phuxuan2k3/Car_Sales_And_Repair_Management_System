const { response } = require('express');
const dbExecute = require('../utils/dbExecute');
const { TableName } = require('pg-promise');
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
    static async insert(entity) {
        return await dbExecute.insert(entity, tableName);
    }
    static async update(id, entity) {
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
        const data = await dbExecute.getById(id,tableName);
        return new Car(data)
    }
    static async getCarPage(searchStr,brands, types, maxPrice, limit, offset) {
        let query = `select * from "${tableName}"`
        let brandQuery;
        let typeQuery;
        let searchQuery;
        let filterArr = [];
        let brandFilter = [];
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
            filterArr.push(typeQuery)
        }
        if(searchStr != undefined) {
            searchQuery = `( "car_name" ilike '%${searchStr}%' )`;
            filterArr.push(searchQuery);
        }
        if (maxPrice != undefined) filterArr.push(`"price" <= ${maxPrice}`)
        let filterString = filterArr.join(' and ');
        if (filterArr.length != 0) query += ' where ' + filterString;
        const totalPage = Math.ceil((await dbExecute.customQuery(query)).length / limit);
        query += ` offset ${offset} limit ${limit}`;
        const data = await dbExecute.customQuery(query);
        const carData = data.map(c => { return new Car(c) });
        return {
            totalPage: totalPage,
            data: carData,
        }
    }
}