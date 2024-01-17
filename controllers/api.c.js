const tryCatch = require('../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../models/car');

module.exports = {
    //Car API
    getAllCar: tryCatch(async (req, res) => {
        const data = await Car.getAll();
        res.json(data);
    }),
    getAllType: tryCatch(async (req, res) => {
        const data = await Car.getAllType();
        res.json(data)
    }),
    getAllBrand: tryCatch(async (req, res) => {
        const data = await Car.getAllBrand();
        res.json(data)
    }),
    getCarPage: tryCatch(async (req, res) => {
        const page = parseInt(req.query.page);
        const perPage = parseInt(req.query.per_page);
        let types = req.query.type;
        let brands = req.query.brand;
        const maxPrice = req.query.max_price;
        const offset = (page - 1) * perPage;
        if (!(brands instanceof Array) && brands != undefined) {
            brands = [brands];
        }
        if (!(types instanceof Array) && types != undefined) {
            types = [types];
        }
        const data = await Car.getCarPage(brands, types, maxPrice, perPage, offset);
        res.json(data);
    }),
}