const mysql = require('mysql')
const util = require("util");

const conn = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    supportBigNumbers: true,
    bigNumberStrings: true,
});

// promise wrapper to enable async await with MYSQL
conn.query = util.promisify(conn.query).bind(conn);

/* Todo create table schema */
conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = conn;
