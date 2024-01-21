const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname((require.main.filename));

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

        let curImgs = [];
       

        res.render('RoleView/store/editCar', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Car', jsFile: 'editCar.js', cssFile: 'store.css', curCar });
    })
    ,
    editCar: tryCatch(async (req, res) => {
        const id = req.params.id;
        const car = req.body;
        await Car.update(id, car);
        res.redirect('/car');
    })
    ,
    getInsertCarPage: tryCatch(async (req, res) => {
        res.render('RoleView/store/insertCar', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Insert Car', jsFile: 'insertCar.js', cssFile: 'store.css' });
    }),
    insertCar: tryCatch(async (req, res) => {
        const car = req.body;
        const id = (await Car.insert(car)).id;

        const carDir = path.join(appDir, `public/images/cars/${id}`);
        const createDir = path.join(carDir, 'others');
        fs.mkdir(createDir, { recursive: true }, (error) => {
            if (error) {
                throw error;
            } else {
                let tempAvatarPath = req.files['avatar'][0].path;
                let realAvatarPath = path.join(carDir, `avatar.jpg`);
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
                        realAvatarPath = path.join(carDir, 'others', e.originalname);
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
    })
}