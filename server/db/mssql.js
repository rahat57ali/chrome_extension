// db/mssql.js
const sql = require('mssql');
require('dotenv').config();
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_SERVER);
console.log(process.env.DB_DATABASE);


const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConnection: true,
    
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  sql,
  pool,
  poolConnect
};
