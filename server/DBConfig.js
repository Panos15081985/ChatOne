const mysql = require("mysql2");

// Connection settings come from environment variables (see README).
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chatone",
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = db;
