require('dotenv').config();
const ENV = process.env;

module.exports = (req, res) => {
    console.log(req.body);

    //Todo: check account here, if wrong, send json {success:bool, message:''}

    //if account is correct
    req.session.isAuth = true;
    //todo: align permission here
    req.session.permission = 'admin';
    if (req.body.Remember) {
        req.session.cookie.maxAge = parseInt(ENV.REMEMBERTIMEACESS);//hour
    }
    return res.redirect(`/dashboard`);
    //or send json {redirect: '/'}
}