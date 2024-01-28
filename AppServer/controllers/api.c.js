const tryCatch = require('../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../models/car');
const AutoPart = require('../models/ap');
const FixedCar = require('../models/fixedCar');
const User = require('../models/user');
const Cart = require('../models/cart');
const { FixRecord } = require('../models/invoices/fixrecord');
const path = require('path');
const appDir = path.dirname((require.main.filename));
const fs = require('fs');
const jwt = require('jsonwebtoken');
const CarType = require('../models/carType');
const CarBrand = require('../models/carBrand');
const bcrypt = require('bcrypt');
const { SaleRecord } = require('../models/invoices/salerecord');
const https = require('https');
const fetch = require('node-fetch');

module.exports = {
    //For store
    getRemainingItems: tryCatch(async (req, res) => {
        const carData = await Car.getAll();
        const apData = await AutoPart.getAll();
        res.json({ car: carData, ap: apData });
    }),
    //Car API
    getAllYear: tryCatch(async (req, res) => {
        const data = await Car.getAllYear();
        res.json(data);
    }),

    getByCarId: tryCatch(async (req, res) => {
        const id = req.query.id;
        const data = await Car.getCarById(id);
        res.json(data);
    }),
    getAllCar: tryCatch(async (req, res) => {
        const data = await Car.getAll();
        res.json(data);
    }),
    getCarByName: tryCatch(async (req, res) => {
        const data = await Car.getCarByName(req.query.name);
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
        let years = req.query.year;
        let brands = req.query.brand;
        let searchStr = req.query.search;
        const maxPrice = req.query.max_price;
        const offset = (page - 1) * perPage;
        if (!(years instanceof Array) && years != undefined) {
            years = [years];
        }
        if (!(brands instanceof Array) && brands != undefined) {
            brands = [brands];
        }
        if (!(types instanceof Array) && types != undefined) {
            types = [types];
        }
        const data = await Car.getCarPage(years, searchStr, brands, types, maxPrice, perPage, offset);
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
            res.json({ success: true, message: 'Delete successfully!' });
        } catch (error) {
            res.json({ success: false, message: error });
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
    getMostCar: tryCatch(async (req, res) => {
        const data = await Car.getMostCar();
        res.json(data);
    }),
    getCarImgs: tryCatch(async (req, res) => {
        const id = req.params.id;
        //todo: make it in utils
        let curImgs = [];
        const directoryPath = path.join(appDir, `public/images/cars/${id}`, 'other');
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }

            files.forEach(file => {
                curImgs.push(file);
            });
            res.json(curImgs);
        });
    }),
    updateCarQuantity: tryCatch(async (req, res) => {
        const { id, quantity } = req.body;
        const rs = await Car.updateQuanTity(id, quantity);
        res.send('done');
    }),
    countCar: tryCatch(async (req, res) => {
        const data = await Car.count();
        res.send(data.sum);
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
    getMostAp: tryCatch(async (req, res) => {
        const data = await AutoPart.getMostAp();
        res.json(data);
    }),
    deleteAp: tryCatch(async (req, res) => {
        const id = req.body.id;
        try {
            await AutoPart.delete(id);
            res.json({ success: true, message: 'Delete successfully!' });
        } catch (error) {
            res.json({ success: false, message: error });
        };
    }),

    updateAutoPartQuantity: tryCatch(async (req, res) => {
        const { ap_id, quantity } = req.body;
        const data = await AutoPart.updateQuanTity(ap_id, quantity);
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
    getFixedCarByCusIdAndSearch: tryCatch(async (req, res) => {
        const id = req.query.id;
        const car_plate = req.query.car_plate == undefined ? null : req.query.car_plate;
        const data = await FixedCar.getFixedCarByCusIdAndSearch(id, car_plate);
        res.json(data);
    }),
    addNewFixedCar: tryCatch(async (req, res) => {
        const entity = req.body;
        const check = await FixedCar.insert(entity);
        if(!check) return res.status(500).send('error');
        const data = await FixRecord.insert(FixRecord.castParam(null, entity.car_plate, new Date(), 0, 'Processing', false));
        return res.json(data);
    }),
    //User

    getUserById: tryCatch(async (req, res) => {
        const data = await User.getById(req.params.id);
        res.json(data);
    }),
    getNumberOfCus: tryCatch(async (req, res) => {
        const data = await User.countCustomer();
        res.json(data.count);
    }),
    getNumberOfEmployee: tryCatch(async (req, res) => {
        const data = await User.countEmployee();
        res.json(data.count);
    }),

    //Cart
    getCartByCusID: tryCatch(async (req, res) => {
        const id = req.query.id;
        const data = await Cart.getCartByCusID(id);
        res.json(data);
    }),
    getCarInCart: tryCatch(async (req, res) => {
        const { customer_ID, car_ID } = req.query;
        let data = await Cart.getCarInCart(customer_ID, car_ID);
        data = data.length <= 0 ? null : data;
        res.json(data);
    }),
    insertToCart: tryCatch(async (req, res) => {
        const entity = req.body;
        const data = await Cart.insert(entity);
        res.json(data);
    }),
    updateCarQuanTityInCart: tryCatch(async (req, res) => {
        const { customer_ID, car_ID, quantity } = req.body;
        let check = await Cart.getCarInCart(customer_ID, car_ID);
        check = check.length <= 0 ? null : check;
        if (check == null) return res.status(400).send('Update error')
        await Cart.updateCarQuanTityInCart(customer_ID, car_ID, quantity);
        return res.json(true);
    }),
    deleteCartItem: tryCatch(async (req, res) => {
        const { customer_ID, car_ID } = req.body;
        await Cart.deleteCartItem(customer_ID, car_ID);
        return res.json(true);
    }),

    //for sale
    getRevenue: tryCatch(async (req, res) => {
        // console.log(req.query.type, req.query.limit);
        const data = await SaleRecord.getTotalPriceByNearestDateChunk(req.query.type, req.query.limit);
        return res.json(data);
    }),
    getTopCar: tryCatch(async (req, res) => {
        const data = await SaleRecord.getTopByQuantity(10);
        return res.json(data);
    }),
    getSaleTotal: tryCatch(async (req, res) => {
        const data = await SaleRecord.getTotalPriceByDateByCus();
        res.json(data);
    }),
    getFixTotal: tryCatch(async (req, res) => {
        const data = await FixRecord.getTotalPriceByDateByPay();
        res.json(data);
    }),

    //PayMent
    getAccount: tryCatch(async (req, res) => {
        let token = jwt.sign({ id: req.user.id }, ENV.SECRET_KEY);
        const data = {
            token: token
        }
        const rs = await fetch(`https://localhost:${ENV.PAYMENT_PORT}/account`, {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(data),
            agent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        if (rs.ok) {
            const rsToken = await rs.json();
            const verifyData = jwt.verify(rsToken, ENV.VERIFY_KEY);
            return res.json(verifyData.account)
        }
        return res.status('400').send('Account not found or err');
    }),
    deposits: tryCatch(async (req, res) => {
        let token = jwt.sign(req.body, ENV.SECRET_KEY);
        const data = {
            token: token,
        }
        const rs = await fetch(`https://localhost:${ENV.PAYMENT_PORT}/deposit`, {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(data),
            agent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        if (rs.ok) {
            const rsToken = await rs.json();
            const verifyData = jwt.verify(rsToken, ENV.VERIFY_KEY);
            return res.json(verifyData)
        }
        return res.status('400').send('Error');

    }),
    transferMoney: tryCatch(async (req, res) => {
        const transactionData = req.body;
        let token = jwt.sign(transactionData, ENV.SECRET_KEY);
        const data = {
            token: token
        }
        const rs = await fetch(`https://localhost:${ENV.PAYMENT_PORT}/transaction`, {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(data),
            agent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        if (rs.ok) {
            const rsToken = await rs.json();
            const verifyData = jwt.verify(rsToken, ENV.VERIFY_KEY);
            return res.json(verifyData)
        }
        return res.status('400').send('Error');
    }),

    paymentHistory: tryCatch(
        async (req, res) => {
            let token = jwt.sign({ id: req.user.id }, ENV.SECRET_KEY);
            const data = {
                token: token
            }
            const rs = await fetch(`https://localhost:${ENV.PAYMENT_PORT}/get-payment-history`, {
                method: 'post',
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                body: JSON.stringify(data),
                agent: new https.Agent({
                    rejectUnauthorized: false,
                })
            });
            if (rs.ok) {
                const rsToken = await rs.json();
                const verifyData = jwt.verify(rsToken, ENV.VERIFY_KEY);
                return res.json(verifyData.data)
            }
            return res.status('400').send('err');
        }
    ),


    // Admin - User
    getAllUsers: tryCatch(async (req, res) => {
        const users = await User.getAll();
        return res.json(users);
    }),
    getUsersByUsernameSearchByPermissionByPage: tryCatch(async (req, res) => {
        const { username, permission, page, perPage } = req.query;
        const users = await User.getByUsernameSearchByPermissionByPage(username, permission, page, perPage);
        return res.json(users);
    }),
    getUsersCountByUsernameSearchByPermission: tryCatch(async (req, res) => {
        const { username, permission } = req.query;
        const count = await User.getCountByUsernameSearchByPermission(username, permission);
        return res.json(count);
    }),
    getUserById: tryCatch(async (req, res) => {
        const { id } = req.query;
        const user = await User.getById(id);
        return res.json(user);
    }),
    insertUser: tryCatch(async (req, res) => {
        const userData = req.body;
        const hash = bcrypt.hashSync(userData.password, parseInt(ENV.SALTROUNDS));
        userData.password = hash;
        const result = await User.insertFromAdmin(userData);
        return res.json(result);
    }),
    updateUser: tryCatch(async (req, res) => {
        const userData = req.body;
        const result = await User.updateFromAdmin(userData);
        return res.json(result);
    }),
    deleteUser: tryCatch(async (req, res) => {
        const { id } = req.body;
        const result = await User.deleteFromAdmin({ id });
        return res.json(result);
    }),
    checkUsernameExists: tryCatch(async (req, res) => {
        const { username } = req.body;
        const result = await User.checkUsernameExists(username);
        return res.json(result);
    }),


    //car type
    getAllCarType: tryCatch(async (req, res) => {
        const data = await CarType.getAll();
        res.json(data);
    }),

    //car brand
    getAllCarBrand: tryCatch(async (req, res) => {
        const data = await CarBrand.getAll();
        res.json(data);
    }),


}