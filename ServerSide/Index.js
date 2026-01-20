// Import required modules
const express = require("express");
const app = express();
const path = require("path");

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true })); // For standard form data (application/x-www-form-urlencoded)
app.use(express.json()); // For JSON data payloads

// Enable Cross-Origin Resource Sharing (CORS)
const cors = require("cors");
app.use(cors());

// Serve static files from the 'ClientSide' directory
app.use(express.static(path.join(__dirname, "..", "ClientSide")));

// Root route to serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "ClientSide", "index.html"));
});

// Route to handle contact form submissions via POST
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log("New contact:", req.body);

  // Send an HTML response back to the client displaying the submitted data
  res.send(`
    <h1>Contact received</h1>
    <p><b>Name:</b> ${name}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Subject:</b> ${subject}</p>
    <p><b>Message:</b> ${message}</p>
    <a href="javascript:history.back()">Back</a>
  `);
});

// Route to handle order submissions via POST
app.post("/order", (req, res) => {
  const { customer, items, total } = req.body;

  // Basic validation: ensure customer data exists and items array is not empty
  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order payload",
    });
  }

  // Generate a dummy random 6-digit order ID
  const orderId = Math.floor(100000 + Math.random() * 900000);

  console.log("New order received:", { orderId, customer, items, total });

  // Return a success JSON response
  return res.status(201).json({
    success: true,
    orderId,
    message: "Order received",
  });
});

// Set server port and start listening for requests
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Import the database connection module
var sql = require("./db.js");

// Route to retrieve all records from the 'products' table
app.get("/customers", function (req, res) {
 sql.query("SELECT * FROM products", (err, mysqlres) => 
 {
    if (err) {
      console.log("error: ", err);
      res.status(400).send("error in getting all customers: " + err);
      return;
    }

    console.log("got all customers...");
    // Send the database results back to the client
    res.send(mysqlres);
    return;
  });
});
