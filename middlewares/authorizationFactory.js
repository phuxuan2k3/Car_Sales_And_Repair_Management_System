const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError');


const guestRouter = require('../routers/siteRoleRouters/guestRouter');

module.exports = (req, res, next) => {
    if (req.session.permission == 'guest') {
        return guestRouter(req, res, next);
    }
    //  else if (req.session.permission == 'admin') {
    //         return adminRouter;
    //     } ...

    next();
}
