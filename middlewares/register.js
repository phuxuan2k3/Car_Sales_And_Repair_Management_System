const User = require('../models/user');
const tryCatch = require('../utils/tryCatch');

module.exports = tryCatch(async (req, res) => {
    let newUser = req.body;
    const existUser = await User.getByUsername(newUser.username);
    if (existUser.length != 0) {
        return res.json({ success: false, message: 'Username is exist!' });
    } else {
        await User.insert(newUser);
        return res.json({ success: true, message: 'Register successfully!' });
    }
})