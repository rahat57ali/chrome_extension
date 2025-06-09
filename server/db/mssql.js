// db/mssql.js
const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConnection: true,
  },
  authentication:{
    type: 'ntlm',
    options: {
      domain: '', // Leave blank unless you're on a domain
      userName: '', // Leave blank to use current user
      password: '', // Leave blank to use current user
        }
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  sql,
  pool,
  poolConnect
};
