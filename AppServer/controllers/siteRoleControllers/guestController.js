const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');
const User = require('../../models/user');
const Cart = require('../../models/cart');
const CarType = require('../../models/carType');
const CarBrand = require('../../models/carBrand');
const AutoPart = require('../../models/ap');
const { SaleRecord, SaleDetail } = require('../../models/invoices/salerecord')
const { FixDetail } = require('../../models/invoices/fixrecord')
const fs = require('fs');
const path = require('path');
const adminId = 479;

const formatData = (per_line, data) => {
    const rs = [];
    const length = data.length;
    const totalLine = Math.ceil(length / per_line);
    for (let j = 0; j < totalLine; j++) {
        const line = [];
        for (let i = 0; i < per_line; i++) {
            if (data[j * per_line + i]) line.push(data[j * per_line + i]);
        }
        rs.push(line);
    }
    return rs;
}

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        let years = await Car.getAllYear();
        let type = await CarType.getAll();
        let brand = await CarBrand.getAll();
        let dir = path.dirname(path.dirname(__dirname));
        const images = await fs.readdirSync(path.join(dir, `public/images/advertisement`));
        let maxPrice = (await Car.getMaxPrice())[0].max;
        res.render('RoleView/guest/guestDashboard', { type: type, brand: brand, years: years, sliderImage: images, maxPrice, userId: req.user.id, nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'guestDashboard.js', cssFile: 'guestDashBoard.css', store: true });
    }),
    getCarDetail: tryCatch(async (req, res) => {
        const id = req.query.id;
        const carData = await Car.getCarById(id);
        const relatedCars = formatData(3, (await Car.getCarByStyle(carData.type)).filter(car => car.id != carData.id));
        let dir = path.dirname(path.dirname(__dirname));
        let cartData = await Cart.getCarInCart(req.user.id, id);
        const images = await fs.readdirSync(path.join(dir, `public/images/cars/${id}/other`));
        cartData = cartData.length <= 0 ? null : cartData[0];
        let cartQuantity = cartData == null ? null : cartData.quantity;
        res.render('RoleView/guest/carDetail', { relatedCars: relatedCars, images: images, cartQuantity: cartQuantity, userId: req.user.id, cartData: cartData, nameOfUser: req.session.passport.user.nameOfUser, data: carData, title: carData.car_name, store: true, jsFile: 'carDetail.js', cssFile: 'carDetail.css' })
    }),
    getRepairService: tryCatch(async (req, res) => {
        res.render('RoleView/guest/repairService', { adminId, userId: req.user.id, nameOfUser: req.session.passport.user.nameOfUser, title: "Repair service", cssFile: "repairService.css", repair: true, jsFile: "repairService.js" });
    }),
    getRepairDetail: tryCatch(async (req, res) => {
        const id = req.query.id;
        let data = await FixDetail.getByFixRecord(id);
        for (const element of data) {
            const mec = await User.getById(element.mec_id);
            const ap = await AutoPart.getAutoPartByID(element.ap_id);
            element.mec = mec;
            element.ap = ap[0];
        }
        res.render('RoleView/guest/repairDetail', { recordId: id, data: data, userId: req.user.id, nameOfUser: req.session.passport.user.nameOfUser, title: "Repair service", jsFile: 'repairDetail.js', repair: true });
    }),
    getCartPage: tryCatch(async (req, res) => {
        const cartData = await Cart.getCartByCusID(req.user.id);
        const saleData = await SaleRecord.getRecordsByCusId(req.user.id);
        for (const cartItem of cartData) {
            const car = await Car.getCarById(cartItem.car_ID);
            cartItem.car = car;
        }
        res.render('RoleView/guest/cartView', { saleData: saleData, adminId, cartData: cartData, userId: req.user.id, nameOfUser: req.session.passport.user.nameOfUser, title: "Cart", cssFile: "cartView.css", jsFile: "cartView.js" });
    }),
    getRecordDetail: tryCatch(async (req, res) => {
        const id = req.query.id;
        const order = await SaleRecord.getRecordById(id);
        const saleData = await SaleDetail.getBySaleRecord(id);
        for (const e of saleData) {
            const car = await Car.getCarById(e.car_id);
            e.car = car;
        }
        res.render('RoleView/guest/saleRecordDetail', { jsFile: 'cartDetail.js', order: order, saleData: saleData, adminId, userId: req.user.id, nameOfUser: req.session.passport.user.nameOfUser, title: "Detail sale order" });
    }),
    getDepositPage: tryCatch(async (req, res) => {
        res.render('RoleView/guest/deposit', { adminId, userId: req.user.id, nameOfUser: req.session.passport.user.nameOfUser, title: "Deposit" });
    })

}