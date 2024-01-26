const jwt = require('jsonwebtoken');

module.exports = (permissionArray) => (req, res, next) => {
    let errMessage = 'No authorization found';
    const authHeader = req.headers.authorization;
    if (authHeader) {
        try {
            const jwtToken = req.headers.authorization.slice(7);
            const user = jwt.verify(jwtToken, "sgx");
            for (const permission of permissionArray) {
                if (user.permission === permission) {
                    return next();
                }
            }
            errMessage = 'No permission';
            req.user = user;
        } catch (err) {
            errMessage = 'Invalid authorize token';
        }
        return res.status(401).json({
            message: errMessage
        });
    }
}