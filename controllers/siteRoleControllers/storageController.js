const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/store/storeDashboard', { nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'storeDashboard.js', cssFile: 'store.css' });
    }),
    getCarPage: tryCatch(async (req, res) => {
        const cars = await Car.getAll();
        res.render('RoleView/store/car', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Cars', jsFile: 'storeCar.js', cssFile: 'store.css', cars });
    }),
    getApPage: tryCatch(async (req, res) => {
        res.render('RoleView/store/ap', { nameOfUser: req.session.passport.user.nameOfUser, title: 'AutoPart', jsFile: 'storeAp.js', cssFile: 'store.css' });
    }),
    getEditCarPage: tryCatch(async (req, res) => {
        const id = req.params.id;
        const curCar = await Car.getCarById(id);
        res.render('RoleView/store/editCar', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Car', jsFile: 'editCar.js', cssFile: 'store.css', curCar });
    })
    ,
    editCar: tryCatch(async (req, res) => {
        const id = req.params.id;
        const car = req.body;
        await Car.update(id, car);
        res.redirect('/car');
    })
}