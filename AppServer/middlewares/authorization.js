module.exports = (permissionArray) => (req, res, next) => {
    for (const permission of permissionArray) {
        if (req.session.passport.user.permission === permission) {
            return next();
        }
    }
    return res.status(401).send({
        message: 'Unauthorized!'
    });
}
