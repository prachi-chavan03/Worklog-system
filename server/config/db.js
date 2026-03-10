import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000, // TiDB usually uses 4000
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ADD THIS BLOCK:
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

// Verification check
pool.getConnection()
  .then(async (conn) => {
    const [dbResult] = await conn.execute("SELECT DATABASE() as db");
    const [userCount] = await conn.execute("SELECT COUNT(*) as total FROM users");
    console.log(`✅ Connected via .env to: ${dbResult[0].db}`);
    console.log(`📊 Users found: ${userCount[0].total}`);
    conn.release();
  })
  .catch(err => {
    console.error("❌ DB CONNECTION ERROR:", err.message);
    console.log("Check if your .env file has the correct password and is in the right folder.");
  });

export default pool;