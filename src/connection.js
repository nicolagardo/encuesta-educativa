const mysql = require('mysql');
const { database } = require('./config');
const { promisify } = require('util');

const pool = mysql.createConnection(database);

pool.connect((err) => {
    if (err) {
        switch (err.code) {
            case 'PROTOCOL_CONNECTION_LOST':
                console.error('Database connection was closed.');
                break;
            case 'ER_CON_COUNT_ERROR':
                console.error('Database has to many connections.');
                break;
            case 'ECONNREFUSED':
                console.error('Database connection was refused.');
                break;
            default:
                console.log('DB is Connected');
                break;
        }
    } else {
        console.log('DB is Connected');
    }

    return;
});
pool.query = promisify(pool.query);
module.exports = pool;