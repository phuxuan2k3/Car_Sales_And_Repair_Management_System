const express = require('express');
const router = express.Router();
const ctrler = require('../controllers/controller');
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
    tableName: 'user_sessions',
    createTableIfMissing: true
});
router.use(session({
    store,
    secret: ENV.SESSIONIDSECRET,
    cookie: {
        maxAge: 30 * 1000//30 secs if not remember user (default choice)
    },
    saveUninitialized: true,
    resave: false
}))


router.use(express.urlencoded({ extended: true }));
router.use(express.static('public'));

//router receive http request here

module.exports = router;