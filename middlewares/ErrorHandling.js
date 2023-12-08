const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');

module.exports = {
    NotFound: (req, res, next) => {
        const err = new AppError(StatusCodes.NOT_FOUND, "File not Found!");
        next(err);
    },

    HandleError: (err, req, res, next) => {
        console.log(err.statusCode);
        if (!(err instanceof AppError)) {
            err = new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Server died!")
        }
        res.status(err.statusCode).render('error', {
            statusCode: err.statusCode,
            errorContent: err,
            title: 'Error',
            cssFile: 'error.css',
            jsFile: 'error.js',
            redirectURL: err.redirectURL,
            redirectContent: err.redirectContent
        });
    }

}