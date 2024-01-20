const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/store/storeDashboard', { nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'storeDashboard.js', cssFile: 'storeDashboard.css' });
    }),
    getCarPage: tryCatch(async (req, res) => {
        res.render('RoleView/store/car', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Cars', jsFile: 'storeCar.js', cssFile: 'storeCar.css' });
    }),
    getApPage: tryCatch(async (req, res) => {
        res.render('RoleView/store/ap', { nameOfUser: req.session.passport.user.nameOfUser, title: 'AutoPart', jsFile: 'storeAp.js', cssFile: 'storeAp.css' });
    })
}