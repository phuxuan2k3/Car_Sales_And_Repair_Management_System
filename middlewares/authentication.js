const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError');

module.exports = {

    auth: (req, res, next) => {
        if (req.session.auth) {
            next();
        } else {
            let err = new AppError(StatusCodes.UNAUTHORIZED, "You must login before access this page!", '/login', 'Login Here!');
            next(err);
        }

    }
}