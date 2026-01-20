const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");
const bodyParser = require("body-parser");

// Middleware to read form data (urlencoded) and JSON
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

const cors = require("cors");
app.use(cors());

// Serve static files from ClientSide folder
app.use(express.static(path.join(__dirname, "..", "ClientSide")));

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "ClientSide", "index.html"));
});

// Contact form route - insert contact message into DB
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log("New contact:", req.body);
  const sql = "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, subject, message], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB error");
    }

    // Send success response with generated contact ID
    res.json({
      success: true,
      ticketId: result.insertId
    });
  });

});

// Order submission route
app.post("/order", (req, res) => {
  const { customer, items, total } = req.body;

  // Basic validation: must have customer data and items
  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order payload",
    });
  }

  const {
    full_name,
    phone,
    email,
    city,
    address,
    zip,
    notes,
  } = customer;

  // Check required fields
  if (!full_name || !phone || !email || !city || !address) {
    return res.status(400).json({
      success: false,
      message: "Missing required customer fields",
    });
  }

  // Compute total price from items to avoid tampering
  const computedTotal = items.reduce((sum, item) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);

    if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0) return sum;
    return sum + price * qty;
  }, 0);

  // Validate computed total
  if (!Number.isFinite(computedTotal) || computedTotal <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid computed total",
    });
  }

  // Insert into orders table
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

  // Execute order insert
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("DB error creating order:", err);
      return res.status(500).json({
        success: false,
        message: "DB error",
      });
    }

    // New order ID
    const orderId = result.insertId;

    // Prepare order_items insert values
    const itemsValues = items.map((item) => [
      orderId,
      item.productId,   // product identifier from frontend
      item.quantity,
      item.price,       // snapshot of unit price
    ]);

    const itemsSql = `
    INSERT INTO order_items
      (order_id, product_id, quantity, unit_price)
    VALUES ?
  `;

    // Insert products in the order
    db.query(itemsSql, [itemsValues], (err2) => {
      if (err2) {
        console.error("DB error creating order_items:", err2);
        return res.status(500).json({
          success: false,
          message: "DB error (order items)",
        });
      }

      // Return success response
      return res.status(201).json({
        success: true,
        orderId,
        message: "Order saved",
      });
    });
  });
});

// Quick DB test endpoint
app.get("/db-test", (req, res) => {
  db.query("SELECT DATABASE() AS db, 1 AS ok", (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

// Get list of all products sorted by popularity
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

// Start HTTP server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
