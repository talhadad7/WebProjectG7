const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");
const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: true })); // בשביל form רגיל (application/x-www-form-urlencoded)
app.use(express.json()); // בשביל JSON
const cors = require("cors");
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "ClientSide")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "ClientSide", "index.html"));
});

app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log("New contact:", req.body);
  const sql = "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, subject, message], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB error");
    }

    res.json({
      success: true,
      ticketId: result.insertId
    });
  });

});
app.post("/order", (req, res) => {
  const { customer, items, total } = req.body;

  // ולידציה בסיסית
  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order payload",
    });
  }

  // מספר הזמנה מדומה (בינתיים)
  const orderId = Math.floor(100000 + Math.random() * 900000);

  console.log("New order received:", { orderId, customer, items, total });

  // בעתיד: כאן נשמור ל-DB (orders + order_items)
  return res.status(201).json({
    success: true,
    orderId,
    message: "Order received",
  });
});
app.get("/db-test", (req, res) => {
  db.query("SELECT DATABASE() AS db, 1 AS ok", (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

app.get("/products", (req, res) => {
  const sql = `
    SELECT id, name, flavor, description, price, weight, image, alt, popularity
    FROM products
    ORDER BY popularity DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB error");
    }
    res.json(results);
  });
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
