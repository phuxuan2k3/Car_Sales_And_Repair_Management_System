const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');
const User = require('../../models/user');
const Cart = require('../../models/cart');
const AutoPart = require('../../models/ap');
const  {FixDetail} = require('../../models/invoices/fixrecord')

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/guest/guestDashboard', {userId: req.user.id ,nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'guestDashboard.js', cssFile: 'guestDashBoard.css', store : true });
    }),
    getCarDetail: tryCatch(async (req, res) => {
        const id = req.query.id;
        const carData = await Car.getCarById(id);
        let cartData = await Cart.getCarInCart(req.user.id,id);
        cartData = cartData.length <= 0 ? null : cartData[0];
        let cartQuantity = cartData ==  null ? null : cartData.quantity;
        res.render('RoleView/guest/carDetail', {cartQuantity: cartQuantity,userId: req.user.id,cartData: cartData, nameOfUser: req.session.passport.user.nameOfUser, data: carData,title: carData.car_name, store: true, jsFile: 'carDetail.js', cssFile: 'carDetail.css' })
    }),
    getRepairService: tryCatch(async (req,res) => {
        res.render('RoleView/guest/repairService', {userId: req.user.id,nameOfUser: req.session.passport.user.nameOfUser,title: "Repair service",cssFile: "repairService.css", repair: true, jsFile: "repairService.js"});
    }),
    getRepairDetail: tryCatch(async (req,res) => {
        const id = req.query.id;
        let data = await FixDetail.getByFixRecord(id);
        for (const element of data) {
            const mec = await User.getById(element.mec_id);
            const ap = await AutoPart.getAutoPartByID(element.ap_id);
            element.mec = mec;
            element.ap = ap[0];
        }
        res.render('RoleView/guest/repairDetail', {recordId: id,data: data,userId: req.user.id,nameOfUser: req.session.passport.user.nameOfUser,title: "Repair service", repair: true});
    })
}