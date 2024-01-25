const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname((require.main.filename));
const AutoPart = require('../../models/ap');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/store/storeDashboard', { nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'storeDashboard.js', cssFile: 'store.css', dashboardPage: true });
    }),
    getCarPage: tryCatch(async (req, res) => {
        const cars = await Car.getAll();
        res.render('RoleView/store/car', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Cars', jsFile: 'storeCar.js', cssFile: 'store.css', cars, carPage: true });
    }),
    getApPage: tryCatch(async (req, res) => {
        const aps = await AutoPart.getAll();
        res.render('RoleView/store/ap', { nameOfUser: req.session.passport.user.nameOfUser, title: 'AutoPart', jsFile: 'storeAp.js', cssFile: 'store.css', aps, apPage: true });
    }),
    getEditCarPage: tryCatch(async (req, res) => {
        const id = req.params.id;
        const curCar = await Car.getCarById(id);

        let curImgs = [];


        res.render('RoleView/store/editCar', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Car', jsFile: 'editCar.js', cssFile: 'store.css', curCar });
    })
    ,
    getEditApPage: tryCatch(async (req, res) => {
        const id = req.params.id;
        const curAp = (await AutoPart.getAutoPartByID(id))[0];
        res.render('RoleView/store/editAp', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Auto Part', jsFile: 'editAp.js', cssFile: 'store.css', curAp });
    })
    ,
    editCar: tryCatch(async (req, res) => {
        const id = req.params.id;
        const car = req.body;
        await Car.update(id, car, req.session.passport.user.id);
        res.redirect('/car');
    })
    ,
    editAp: tryCatch(async (req, res) => {
        const id = req.params.id;
        const ap = req.body;
        await AutoPart.update(id, ap, req.session.passport.user.id);
        res.redirect('/ap');
    })
    ,
    getInsertCarPage: tryCatch(async (req, res) => {
        res.render('RoleView/store/insertCar', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Insert Car', jsFile: 'insertCar.js', cssFile: 'store.css' });
    }),
    getInsertApPage: tryCatch(async (req, res) => {
        res.render('RoleView/store/insertAp', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Insert Auto Part', jsFile: 'insertAp.js', cssFile: 'store.css' });
    }),
    insertCar: tryCatch(async (req, res) => {
        const car = req.body;
        const test = await Car.insert(car, req.session.passport.user.id);
        const id = ((test)[0]).add_newcar;

        const carDir = path.join(appDir, `public/images/cars/${id}`);
        const createDir = path.join(carDir, 'other');
        fs.mkdir(createDir, { recursive: true }, (error) => {
            if (error) {
                throw error;
            } else {
                let tempAvatarPath = req.files['avatar'][0].path;
                let realAvatarPath = path.join(carDir, `avatar.png`);
                fs.rename(tempAvatarPath, realAvatarPath, (error) => {
                    if (error) {
                        console.error('Error renaming file:', error);
                    } else {
                        console.log('File renamed successfully');
                    }
                });
                if (req.files['other-images']) {
                    req.files['other-images'].forEach(async e => {
                        tempAvatarPath = e.path;
                        realAvatarPath = path.join(carDir, 'other', e.originalname);
                        fs.rename(tempAvatarPath, realAvatarPath, (error) => {
                            if (error) {
                                console.error('Error renaming file:', error);
                            } else {
                                console.log('File renamed successfully');
                            }
                        });
                    });
                }
            }
        })
        res.redirect('/car');
    }),
    insertAp: tryCatch(async (req, res) => {
        const ap = req.body;
        await AutoPart.insert(ap, req.session.passport.user.id);
        res.redirect('/ap');
    })
}