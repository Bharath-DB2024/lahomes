const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", 
  database: "task",  // Ensure this database exists
});

db.connect((err) => {
  if (err) {
    console.error(" Database connection failed:", err);
    process.exit(1);  // Stop server if DB connection fails
  }
  console.log("Connected to MySQL database 'task'");
});

module.exports = db;
