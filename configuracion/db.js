const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

pool.getConnection()
  .then(conn => {
    console.log('✦ MySQL conectado correctamente');
    conn.release();
  })
  .catch(err => {
    console.error('✕ Error conectando MySQL:', err.message);
  });

module.exports = pool;