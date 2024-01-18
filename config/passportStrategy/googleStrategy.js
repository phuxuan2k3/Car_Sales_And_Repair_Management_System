const GoogleStrategy = require('passport-google-oidc');
const ENV = process.env;
const FC = require('../../models/federated_credentials');
const User = require('../../models/user');

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: ENV['GOOGLE_CLIENT_ID'],
        clientSecret: ENV['GOOGLE_CLIENT_SECRET'],
        callbackURL: '/oauth2/redirect/google',
        scope: ['profile']
    }, async function verify(issuer, profile, cb) {

        try {
            const data = await FC.getByProviderAndSubject(issuer, profile.id);
            let user;
            if (data.length == 0) {
                const user_id = (await User.insert({ firstname: profile.displayName }))['id'];
                await FC.insert({ user_id, provider: issuer, subject: profile.id });
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
    }))
}