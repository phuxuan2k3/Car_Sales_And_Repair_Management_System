const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/store/storeDashboard', { nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'storeDashboard.js', cssFile: 'storeDashboard.css' });
    })
}