const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 800,
  user: 'root',
  password: '1234',
  database: 'eventplanner',
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