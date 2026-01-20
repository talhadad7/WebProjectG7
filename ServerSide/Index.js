const express = require("express");
const app = express();
const path = require("path");
const db = require("./db"); // DB connection
const bodyParser = require("body-parser");

// Parse form & JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const cors = require("cors");
app.use(cors());

app.use(express.static(path.join(__dirname, "..", "ClientSide")));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "ClientSide", "index.html"));
});

// Contact form endpoint
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  const sql =
    "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, subject, message], (err, result) => {
    if (err) return res.status(500).send("DB error");

    res.json({
      success: true,
      ticketId: result.insertId,
    });
  });
});

// Create new order
app.post("/order", (req, res) => {
  const { customer, items, total } = req.body;

  // Basic payload validation
  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false });
  }

  const { full_name, phone, email, city, address, zip, notes } = customer;

  // Required customer fields
  if (!full_name || !phone || !email || !city || !address) {
    return res.status(400).json({ success: false });
  }

  // Calculate total on server
  const computedTotal = items.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);

  const sql = `
    INSERT INTO orders
      (full_name, phone, email, city, address, zip, notes, total)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    full_name,
    phone,
    email,
    city,
    address,
    zip || null,
    notes || null,
    computedTotal,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ success: false });

    const orderId = result.insertId;

    const itemsValues = items.map((item) => [
      orderId,
      item.productId,
      item.quantity,
      item.price,
    ]);

    const itemsSql = `
      INSERT INTO order_items
        (order_id, product_id, quantity, unit_price)
      VALUES ?
    `;

    db.query(itemsSql, [itemsValues], (err2) => {
      if (err2) return res.status(500).json({ success: false });

      res.status(201).json({
        success: true,
        orderId,
      });
    });
  });
});

// Simple DB connection test
app.get("/db-test", (req, res) => {
  db.query("SELECT DATABASE() AS db", (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

// Get all products
app.get("/products", (req, res) => {
  const sql = `
    SELECT id, name, flavor, description, price, weight, image, alt, popularity
    FROM products
    ORDER BY popularity DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("DB error");
    res.json(results);
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
