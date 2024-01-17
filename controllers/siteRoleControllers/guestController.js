const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/guest/guestDashboard', { title: 'DashBoard',jsFile: 'guestDashboard.js',cssFile: 'guestDashBoard.css', store : true });
    }),
    getCarDetail: tryCatch(async (req,res) => {
        const id = req.query.id;
        const carData = await Car.getCarById(id);
        res.render('RoleView/guest/carDetail',{data: carData[0],title: carData[0].car_name, store: true})
    }),
    getRepairService: tryCatch(async (req,res) => {
        res.render('RoleView/guest/repairService', {title: "Repair service", repair: true});
    })
}