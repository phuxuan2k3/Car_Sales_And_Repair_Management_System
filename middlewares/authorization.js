const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError');

module.exports = (permission) => {
    return (req, res, next) => {
        if (permission.includes(req.session.permission)) {
            next();
        } else {
            let err = new AppError(StatusCodes.UNAUTHORIZED, "You don't have permission to access this page!");
            next(err);
        }
    }
}
