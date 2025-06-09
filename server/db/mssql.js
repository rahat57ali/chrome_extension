
const sql = require('mssql');
require('dotenv').config();
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_User:', process.env.DB_USER);
console.log('DB_Pasword:', process.env.DB_PASSWORD);

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
