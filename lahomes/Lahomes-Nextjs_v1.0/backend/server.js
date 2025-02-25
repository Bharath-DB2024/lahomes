const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("./config/db");  // Import the separate DB connection
const Addagent = require("./controllers/Add_agent");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"], credentials: true }));


db.changeUser({ database: "task" }, (err) => {
  if (err) {
    console.error("Error switching to 'task' database: ", err);
    return;
  }

  const createAgentsTable = `
   CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    number VARCHAR(20) NOT NULL,
    propertiesNumber INT NOT NULL,
    description TEXT NOT NULL,
    zipCode VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

  `;

  db.query(createAgentsTable, (err, result) => {
    if (err) {
      console.error("Error creating agents table: ", err);
    } else {
      console.log("✅ Agents table is ready");
    }
  });
});


// User Registration
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User registered successfully" });
    }
  );
});

// User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(401).json({ error: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, "dbproductions", { expiresIn: "1m" });

    return res.json({ message: "Login successful", token });
  });
});

// Add Agent Route
app.post("/addagents", Addagent.post);

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
