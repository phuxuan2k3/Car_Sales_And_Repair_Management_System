const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError');


const guestRouter = require('../routers/siteRoleRouters/guestRouter');
const mechanicRouter = require('../routers/siteRoleRouters/mechanicRouter');
const storeRouter = require('../routers/siteRoleRouters/storageRouter');
const saleRouter = require('../routers/siteRoleRouters/saleRouter');


module.exports = (req, res, next) => {
    if (req.session.passport.user.permission == 'cus') {
        return guestRouter(req, res, next);
    }
    else if (req.session.passport.user.permission == 'mec') {
        return mechanicRouter(req, res, next);
    }
    else if (req.session.passport.user.permission == 'sm') {
        return storeRouter(req, res, next);
    }
    else if (req.session.passport.user.permission == 'sa') {
        return mechanicRouter(req, res, next);
    }
    next();
}
