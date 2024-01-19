const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/mechanic/mechanicDashboard', { title: 'DashBoard' });
    })
}