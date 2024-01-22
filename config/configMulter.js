const multer = require('multer');
const uniqueString = require('../utils/uniqueString');
const fs = require("fs");
const rimraf = require('rimraf');
const path = require('path');
const appDir = path.dirname((require.main.filename));
const basePattern = '/car/edit';
const regexPattern = new RegExp(`^${basePattern}/\\d+$`);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (regexPattern.test(req.url)) {

            if (file.fieldname == 'avatar') {
                cb(null, path.join(appDir, `public/images/cars/${req.params.id}`))
            } else {
                cb(null, path.join(appDir, `public/images/cars/${req.params.id}/other`))
            }
        }
        else {
            if (file.fieldname == 'avatar') {
                cb(null, path.join(appDir, `public/images/cars/tmp`))
            } else {
                cb(null, path.join(appDir, `public/images/cars/tmp/other`))
            }
        }

    },
    filename: (req, file, cb) => {
        if (regexPattern.test(req.url)) {

            const fileExtension = file.originalname.slice(file.originalname.lastIndexOf('.'));
            if (file.fieldname == 'avatar') {
                cb(null, file.fieldname + fileExtension);
            } else {
                const uniqueSuffix = uniqueString();
                cb(null, uniqueSuffix + fileExtension);
            }
        } else {
            cb(null, file.originalname);
        }
    }
})

module.exports = multer({
    storage
})