const pgp = require('pg-promise')({ capSQL: true });
require('dotenv').config();
const ENV = process.env;
const cn = {
    host: ENV.DBHOST,
    port: ENV.DBPORT,
    database: ENV.DBNAME,
    user: ENV.DBUSERNAME,
    password: ENV.DBPASSWORD,
    max: ENV.DPMAX
};
db = pgp(cn);

module.exports = { db, pgp };