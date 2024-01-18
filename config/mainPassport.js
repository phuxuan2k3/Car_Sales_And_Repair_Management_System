const passport = require('passport');
const configLocalPassport = require('./passportStrategy/localStrategy');
const configFacebookPassport = require('./passportStrategy/facebookStrategy');

const User = require('../models/user');

configLocalPassport(passport);
configFacebookPassport(passport);

passport.serializeUser((user, done) => {
    done(null, { id: user.id, permission: user.permission });
});

passport.deserializeUser(async function (deUser, done) {
    try {
        const user = await User.getById(deUser.id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;