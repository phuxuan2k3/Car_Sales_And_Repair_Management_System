const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        req.session;
        res.render('RoleView/guest/guestDashboard', { nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'guestDashboard.js', cssFile: 'guestDashBoard.css' });
    }),
    getCarDetail: tryCatch(async (req, res) => {
        const id = req.query.id;
        const carData = await Car.getCarById(id);
        res.render('RoleView/guest/carDetail', { nameOfUser: req.session.passport.user.nameOfUser, data: carData[0] })
    })
}