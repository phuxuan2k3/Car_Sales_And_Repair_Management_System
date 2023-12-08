module.exports = {
    Permission: (permission) => {
        return (req, res, next) => {
            if (permission.includes(req.session.permission)) {
                next();
            } else {
                const err = new Error("You don't have permission to access this page!");
                next(err);
            }
        }
    }
}