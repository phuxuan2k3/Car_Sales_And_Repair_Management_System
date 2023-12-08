require('dotenv').config();
const ENV = process.env;

module.exports = (req, res) => {

    console.log(req.body);

    //Todo: check account here, if wrong, send json {success:bool, message:''}

    //if account is correct
    req.session.isAuth = true;
    if (req.body.Remember) {
        req.session.cookie.maxAge = ENV.REMEMBERTIMEACESS;//hour
    }
    return res.redirect('/');
    //or send json {redirect: '/'}
}