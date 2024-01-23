const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname((require.main.filename));

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/sale/dashboard', { nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css' });
    })
}