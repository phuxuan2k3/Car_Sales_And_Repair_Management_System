const pgp = require('pg-promise')({ capSQL: true });
require('dotenv').config();
const ENV = process.env;
const cn = {
    host: ENV.PAYMENT_DBHOST,
    port: ENV.PAYMENT_DBPORT,
    database: ENV.PAYMENT_DBNAME,
    user: ENV.PAYMENT_DBUSERNAME,
    password: ENV.PAYMENT_DBPASSWORD,
    max: ENV.DPMAX
};
db = pgp(cn);

module.exports = { db, pgp };