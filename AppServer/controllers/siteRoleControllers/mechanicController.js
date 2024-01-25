const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/mechanic/mechanicDashboard', {nameOfUser: req.session.passport.user.nameOfUser ,jsFile: 'mechanicDashboard.js',cssFile: 'mechanicDashboard.css',userId: req.user.id, title: 'DashBoard' });
    })
}