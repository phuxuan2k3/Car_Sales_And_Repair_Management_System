const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
    if (req.session == undefined) {
        let err = new AppError(StatusCodes.UNAUTHORIZED, "You must login before access this page!", '/login', 'Login Here!');
        next(err);
    } else if(req.session.isAuth) {
        next();
    }
}
