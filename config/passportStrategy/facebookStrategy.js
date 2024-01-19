require('dotenv').config();
const ENV = process.env;
const FC = require('../../models/federated_credentials');
const User = require('../../models/user');
const FacebookStrategy = require('passport-facebook');

module.exports = (passport) => {
    passport.use(new FacebookStrategy({
        clientID: ENV['FACEBOOK_CLIENT_ID'],
        clientSecret: ENV['FACEBOOK_CLIENT_SECRET'],
        callbackURL: '/oauth2/redirect/facebook',
        state: true,
        profileFields: ['id', 'displayName', 'birthday']
    }, async function verify(accessToken, refreshToken, profile, cb) {
        try {
            const data = await FC.getByProviderAndSubject(profile.provider, profile.id);
            let user;
            if (data.length == 0) {
                const user_id = (await User.insert({ firstname: profile.displayName, dob: profile.birthday }))['id'];
                await FC.insert({ user_id, provider: profile.provider, subject: profile.id });
                user = {
                    id: user_id,
                    nameOfUser: profile.displayName,
                    permission: 'cus',
                };
            }
            else {
                let row = data[0];
                user = await User.getById(row.user_id);
                user.nameOfUser = user.firstname;
            }
            return cb(null, user);
        } catch (error) {
            return cb(error);
        }
    }));
}