const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname((require.main.filename));
const AutoPart = require('../../models/ap');
const pagination = require('../../utils/pagination');
const CarType = require('../../models/carType');
const CarBrand = require('../../models/carBrand');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/store/storeDashboard', { nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'storeDashboard.js', cssFile: 'store.css', dashboardPage: true });
    }),
    getCarPage: tryCatch(async (req, res) => {
        const noCarPerPage = 2;
        const noAllCar = (await Car.countRecord()).count;
        const paginationResult = await pagination(noCarPerPage, noAllCar, req.query.page);

        const cars = await Car.getCustom(noCarPerPage, (paginationResult.page - 1) * noCarPerPage);

        res.render('RoleView/store/car', { totalPage: paginationResult.noPage, page: paginationResult.page, pageState: paginationResult.pageState, pagination: paginationResult.pagination, nameOfUser: req.session.passport.user.nameOfUser, title: 'Cars', jsFile: 'storeCar.js', cssFile: 'store.css', cars, carPage: true });
    }),
    getApPage: tryCatch(async (req, res) => {
        const noApPerPage = 2;
        const noAllAp = (await AutoPart.countRecord()).count;
        const paginationResult = await pagination(noApPerPage, noAllAp, req.query.page);

        const aps = await AutoPart.getCustom(noApPerPage, (paginationResult.page - 1) * noApPerPage);

        res.render('RoleView/store/ap', { totalPage: paginationResult.noPage, page: paginationResult.page, pageState: paginationResult.pageState, pagination: paginationResult.pagination, nameOfUser: req.session.passport.user.nameOfUser, title: 'AutoPart', jsFile: 'storeAp.js', cssFile: 'store.css', aps, apPage: true });
    }),
    getEditCarPage: tryCatch(async (req, res) => {
        const id = req.params.id;
        const curCar = await Car.getCarById(id);

        const allTypes = await CarType.getAll();
        const allBrands = await CarBrand.getAll();

        let curImgs = [];
        res.render('RoleView/store/editCar', { allBrands, allTypes, nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Car', jsFile: 'editCar.js', cssFile: 'store.css', curCar });
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
        const allTypes = await CarType.getAll();
        const allBrands = await CarBrand.getAll();
        res.render('RoleView/store/insertCar', { allTypes, allBrands, nameOfUser: req.session.passport.user.nameOfUser, title: 'Insert Car', jsFile: 'insertCar.js', cssFile: 'store.css' });
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
    ,
    getBrandPage: tryCatch(async (req, res) => {

        const noCarPerPage = 5;
        const noAllCar = (await CarBrand.countRecord()).count;
        const paginationResult = await pagination(noCarPerPage, noAllCar, req.query.page);

        const allBrands = await CarBrand.getCustom(noCarPerPage, (paginationResult.page - 1) * noCarPerPage);

        res.render('RoleView/store/brand', { totalPage: paginationResult.noPage, page: paginationResult.page, pageState: paginationResult.pageState, pagination: paginationResult.pagination, allBrands, nameOfUser: req.session.passport.user.nameOfUser, title: 'Brand', jsFile: 'storeBrand.js', cssFile: 'store.css' });
    }),
    getEditBrandPage: tryCatch(async (req, res) => {
        const brand = req.params.brand;
        const curBrand = (await CarBrand.getBrand(brand))[0];
        res.render('RoleView/store/editBrand', { curBrand, nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Car', jsFile: 'storeBrand.js', cssFile: 'store.css' });
    })
    ,
    editBrand: tryCatch(async (req, res) => {
        const oldBrand = req.params.brand;
        const newBrand = req.body.brand;
        await CarBrand.update(newBrand, oldBrand);
        res.redirect('/brand');
    }),
    getInsertBrandPage: tryCatch(async (req, res) => {
        res.render('RoleView/store/insertBrand', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Car', jsFile: 'storeBrand.js', cssFile: 'store.css' });
    })
    ,
    insertBrand: tryCatch(async (req, res) => {
        const brand = req.body.brand;
        await CarBrand.insert({ brand });
        res.redirect('/brand');
    }),
    deleteBrand: tryCatch(async (req, res) => {
        const brand = req.params.brand;
        await CarBrand.deleteBrand(brand);
        res.json({
            success: true
        })
    }),

    getTypePage: tryCatch(async (req, res) => {
        const noCarPerPage = 5;
        const noAllCar = (await CarType.countRecord()).count;
        const paginationResult = await pagination(noCarPerPage, noAllCar, req.query.page);

        const allTypes = await CarType.getCustom(noCarPerPage, (paginationResult.page - 1) * noCarPerPage);
        res.render('RoleView/store/type', { totalPage: paginationResult.noPage, page: paginationResult.page, pageState: paginationResult.pageState, pagination: paginationResult.pagination, allTypes, nameOfUser: req.session.passport.user.nameOfUser, title: 'Brand', jsFile: 'storeType.js', cssFile: 'store.css' });
    }),
    getEditTypePage: tryCatch(async (req, res) => {
        const type = req.params.type;
        const curType = (await CarType.getType(type))[0];
        res.render('RoleView/store/editType', { curType, nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Car', jsFile: 'storeType.js', cssFile: 'store.css' });
    })
    ,
    editType: tryCatch(async (req, res) => {
        const oldType = req.params.type;
        const newType = req.body.type;
        await CarType.update(newType, oldType);
        res.redirect('/type');
    }),
    getInsertTypePage: tryCatch(async (req, res) => {
        res.render('RoleView/store/insertType', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Edit Car', jsFile: 'storeType.js', cssFile: 'store.css' });
    })
    ,
    insertType: tryCatch(async (req, res) => {
        const type = req.body.type;
        await CarType.insert({ type });
        res.redirect('/type');
    }),
    deleteType: tryCatch(async (req, res) => {
        const type = req.params.type;
        await CarType.deleteType(type);
        res.json({
            success: true
        })
    }),
}