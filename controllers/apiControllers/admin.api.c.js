const tryCatch = require('../../utils/tryCatch');
const User = require('../../models/user');
require('dotenv').config();

module.exports = {
    getAllUser: tryCatch(async (req, res) => {
        const users = await User.getAll();
        return res.json(users);
    }),
    getByUsernameSearchByPermissionByPage: tryCatch(async (req, res) => {
        const { username, permission, page, perPage } = req.query;
        const users = await User.getByUsernameSearchByPermissionByPage(username, permission, page, perPage);
        return res.json(users);
    }),
}