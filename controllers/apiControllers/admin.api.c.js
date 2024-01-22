const tryCatch = require('../../utils/tryCatch');
const User = require('../../models/user');
require('dotenv').config();

module.exports = {
    getAll: tryCatch(async (req, res) => {
        const users = await User.getAll();
        return res.json(users);
    }),
    getByUsernameSearchByPermissionByPage: tryCatch(async (req, res) => {
        const { username, permission, page, perPage } = req.query;
        const users = await User.getByUsernameSearchByPermissionByPage(username, permission, page, perPage);
        return res.json(users);
    }),
    getCountByUsernameSearchByPermission: tryCatch(async (req, res) => {
        const { username, permission } = req.query;
        const count = await User.getCountByUsernameSearchByPermission(username, permission);
        return res.json(count);
    }),
    getById: tryCatch(async (req, res) => {
        const { id } = req.query;
        const user = await User.getById(id);
        return res.json(user);
    }),

    insertUser: tryCatch(async (req, res) => {
        const userData = req.body;
        const result = await User.insert2(userData);
        return res.json(result);
    }),
    updateUser: tryCatch(async (req, res) => {
        const userData = req.body;
        const result = await User.update2(userData);
        return res.json(result);
    }),
    deleteUser: tryCatch(async (req, res) => {
        const { id } = req.body;
        const result = await User.delete2({ id });
        return res.json(result);
    }),
    checkUsernameExists: tryCatch(async (req, res) => {
        const { username } = req.body;
        const result = await User.checkUsernameExists(username);
        return res.json(result);
    }),
}