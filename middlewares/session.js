const session = require('express-session');
require('dotenv').config();
const ENV = process.env;
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);

const pgPool = new pg.Pool({
    database: ENV.DBNAME,
    user: ENV.DBUSERNAME,
    password: ENV.DBPASSWORD,
    port: ENV.DBPORT,
});
const store = new pgSession({
    pool: pgPool,
    tableName: 'UserSessions',
    createTableIfMissing: true
});

module.exports = session({
    store,
    secret: ENV.SESSIONIDSECRET,
    cookie: {
        maxAge: parseInt(ENV.DEFAULTTIMEACCESS)
    },
    saveUninitialized: true,
    resave: false
})