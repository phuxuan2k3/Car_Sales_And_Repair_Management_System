const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const User = require('../../models/user');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render(
            'RoleView/admin/adminDashboard',
            {
                nameOfUser: req.session.passport.user.nameOfUser,
                title: 'DashBoard',
                jsFile: 'adminDashboard.js',
                cssFile: 'adminDashBoard.css',
            });
    }),
    getCarDetail: tryCatch(async (req, res) => {
        const id = req.query.id;
        const carData = await Car.getCarById(id);
        res.render(
            'RoleView/admin/userDetail',
            {
                nameOfUser: req.session.passport.user.nameOfUser,
                data: carData,
                title: carData.car_name,
                store: true
            });
    }),
}