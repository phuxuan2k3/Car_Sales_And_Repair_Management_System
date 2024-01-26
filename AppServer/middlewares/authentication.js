const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        const jwtUser = jwt.sign(req.user, "sgx");
        res.cookie('auth', jwtUser);
        return next();
    }
    return res.redirect('/login');
};