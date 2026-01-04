const mysql2 = require("mysql2/promise");
const config = require("./config");

const pool = mysql2.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: 40,
  queueLimit: 0,
});

const closeDB = async () => {
  try {
    await pool.end();
    console.log("✅ Database pool closed");
  } catch (err) {
    console.error("❌ Error closing database pool:", err);
  }
};

module.exports = { pool, closeDB };
