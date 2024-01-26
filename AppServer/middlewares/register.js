const User = require('../models/user');
const tryCatch = require('../utils/tryCatch');
const bcrypt = require('bcrypt');
require('dotenv').config();
const ENV = process.env;

module.exports = tryCatch(async (req, res) => {
    let newUser = req.body;
    const existUser = await User.getByUsername(newUser.username);
    if (existUser.length != 0) {
        return res.json({ success: false, message: 'Username is exist!' });
    } else {
        const hash = bcrypt.hashSync(newUser.password, parseInt(ENV.SALTROUNDS));
        newUser.password = hash
        await User.insert(newUser);
        return res.json({ success: true, message: 'Register successfully!' });
    }
})