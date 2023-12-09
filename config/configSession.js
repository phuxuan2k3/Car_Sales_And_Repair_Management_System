const session = require('express-session');
require('dotenv').config();
const ENV = process.env;
const pgSession = require('connect-pg-simple')(session);


const pg = require('pg');

const pgPool = new pg.Pool({
    host: ENV.DBHOST,
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

const configSession = (app) => {
    app.use(session({
        store,
        secret: ENV.SESSIONIDSECRET,
        cookie: {
            maxAge: parseInt(ENV.DEFAULTTIMEACCESS)
        },
        saveUninitialized: true,
        resave: false
    }))
}

module.exports = configSession;