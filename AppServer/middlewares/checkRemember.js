require('dotenv').config();
const ENV = process.env;

module.exports = (req, res, next) => {
    if (req.body.Remember) {
        req.session.cookie.maxAge = parseInt(ENV.REMEMBERTIMEACESS);
    }
    next();
}