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

//do this in utils/dbExecute.js
// module.exports = {
//     execute:  async (sql, param) => {
//         let dbcn = null;
//         try {
//             dbcn = await db.connect();
//             const data = await dbcn.query(sql, param);
//             return data;
//         } catch (error) {
//             throw error;
//         } finally {
//             if (dbcn) {
//                 dbcn.done();
//             }
//         }
//     }
// }

 module.exports = { db, pgp };