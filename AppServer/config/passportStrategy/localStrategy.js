const User = require('../../models/user');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = (passport) => {
    passport.use('local', new LocalStrategy({ usernameField: 'Username', passwordField: 'Password' }, async (username, password, done) => {
        try {
            const data = await User.getByUsername(username);
            if (data.length == 0) {
                return done(null, false, { message: 'Username does not exist!' });
            }

            const user = data[0];

            //todo: change password to hashed password
            if (!(await bcrypt.compare(password, user.password))) {
                return done(null, false, { message: 'Password incorrect!' });
            }
            // if ((password !== user.password)) {
            //     return done(null, false, { message: 'Password incorrect!' });
            // }

            user.nameOfUser = user.lastname + ' ' + user.firstname;
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }))
}