const express = require("express");
const app = express();
const path = require("path");

// Body parsing middleware
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

// Enable CORS
const cors = require("cors");
app.use(cors());

// Serve static files from the client side folder
app.use(express.static(path.join(__dirname, "..", "ClientSide")));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "ClientSide", "index.html"));
});

// Contact form endpoint
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  console.log("New contact:", req.body);

  res.send(`
    <h1>Contact received</h1>
    <p><b>Name:</b> ${name}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Subject:</b> ${subject}</p>
    <p><b>Message:</b> ${message}</p>
    <a href="javascript:history.back()">Back</a>
  `);
});

// Order placement endpoint
app.post("/order", (req, res) => {
  const { customer, items, total } = req.body;

  // Basic validation
  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order payload",
    });
  }

  // Generate mock order ID
  const orderId = Math.floor(100000 + Math.random() * 900000);
  console.log("New order received:", { orderId, customer, items, total });

  return res.status(201).json({
    success: true,
    orderId,
    message: "Order received",
  });
});

// Server configuration
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Database connection
var sql = require("./db.js");

// Fetch products data
app.get("/customers", function (req, res) {
 sql.query("SELECT * FROM products", (err, mysqlres) => 
 {
    if (err) {
      console.log("error: ", err);
      res.status(400).send("error in getting all customers: " + err);
      return;
    }

    console.log("got all customers...");
    res.send(mysqlres);
    return;
  });
});
