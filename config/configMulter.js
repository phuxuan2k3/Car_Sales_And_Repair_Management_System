const multer = require('multer');
const uniqueString = require('../utils/uniqueString');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname == 'avatar') {
            cb(null, `./public/images/cars/${req.params.id}`)
        } else {
            cb(null, `./public/images/cars/${req.params.id}/others`)
        }
    },
    filename: (req, file, cb) => {
        const fileExtension = file.originalname.slice(file.originalname.lastIndexOf('.'));
        if (file.fieldname == 'avatar') {
            cb(null, file.fieldname + fileExtension);
        } else {
            const uniqueSuffix = uniqueString();
            cb(null, uniqueSuffix + fileExtension);
        }

    }
})

module.exports = multer({
    storage
})