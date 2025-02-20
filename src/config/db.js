require('dotenv').config();
const mysql = require('mysql2/promise'); // Use promise wrapper

const db = mysql.createPool({ // Use connection pooling for better performance
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0
});

db.getConnection()
  .then(() => console.log('Connected to MySQL database.'))
  .catch((err) => console.error('Database connection failed:', err));

module.exports = db;
