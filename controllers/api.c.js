const tryCatch = require('../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../models/car');
const AutoPart = require('../models/ap');
const FixedCar = require('../models/fixedCar');
const User = require('../models/user');

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
        let searchStr = req.query.search;
        const maxPrice = req.query.max_price;
        const offset = (page - 1) * perPage;
        if (!(brands instanceof Array) && brands != undefined) {
            brands = [brands];
        }
        if (!(types instanceof Array) && types != undefined) {
            types = [types];
        }
        const data = await Car.getCarPage(searchStr, brands, types, maxPrice, perPage, offset);
        res.json(data);
    }),
    addNewCar: tryCatch(async (req, res) => {
        const entity = req.body.entity;
        const id = await Car.insert(entity);
        res.json(id);
    }),
    deleteCar: tryCatch(async (req, res) => {
        const id = req.body.id;
        try {
            await Car.delete(id);
            req.json({ rs: true });
        } catch (error) {
            req.json({ rs: false });
        };
    }),
    updateCar: tryCatch(async (req, res) => {
        const id = req.body.id;
        const entity = req.body.entity;
        try {
            await Car.update(id, entity);
            req.json({ rs: true });
        } catch (error) {
            req.json({ rs: false });
        };
    }),
    getNumberOfRemainingCar: tryCatch(async (req, res) => {
        const data = await Car.getNoRemainingCar();
        res.json(data);
    }),
    getMostCar: tryCatch(async (req, res) => {
        const data = await Car.getMostCar();
        res.json(data);
    }),


    //Auto part API
    getAllAp: tryCatch(async (req, res) => {
        const data = await AutoPart.getAll();
        res.json(data);
    }),
    getApPage: tryCatch(async (req, res) => {
        const page = parseInt(req.query.page);
        const perPage = parseInt(req.query.per_page);
        const offset = (page - 1) * perPage;
        let suppliers = req.query.supplier;
        if (!(suppliers instanceof Array) && suppliers != undefined) {
            suppliers = [suppliers];
        }
        const data = await AutoPart.getApPage(suppliers, perPage, offset);
        res.json(data);
    }),
    getAllSupplier: tryCatch(async (req, res) => {
        const data = await AutoPart.getAllSupplier();
        res.json(data);
    }),
    getAp: tryCatch(async (req, res) => {
        const id = req.query.id;
        const data = await AutoPart.getAutoPartByID(id);
        res.json(data);
    }),
    addNewAutoPart: tryCatch(async (req, res) => {
        const entity = req.body.entity;
        const id = await Car.insert(entity);
        res.json(id);
    }),
    deleteAutoPart: tryCatch(async (req, res) => {
        const id = req.body.id;
        try {
            await AutoPart.delete(id);
            req.json({ rs: true });
        } catch (error) {
            req.json({ rs: false });
        };
    }),
    updateAutoPart: tryCatch(async (req, res) => {
        const id = req.body.id;
        const entity = req.body.entity;
        try {
            await AutoPart.update(id, entity);
            req.json({ rs: true });
        } catch (error) {
            req.json({ rs: false });
        };
    }),
    getNumberOfRemainingAutoPart: tryCatch(async (req, res) => {
        const data = await AutoPart.getNoRemainingAp();
        res.json(data);
    }),
    getMostAp: tryCatch(async (req, res) => {
        const data = await AutoPart.getMostAp();
        res.json(data);
    }),

    //Fixed car API
    getAllFixedCar: tryCatch(async (req, res) => {
        const data = await FixedCar.getAll();
        res.json(data);
    }),
    getFixedCarByCusId: tryCatch(async (req, res) => {
        const id = req.query.id;
        const data = await FixedCar.getFixedCarByCusId(id);
        res.json(data);
    }),


    //User
    getUserById: tryCatch(async (req, res) => {
        const data = await User.getById(req.params.id);
        res.json(data);
    })
}