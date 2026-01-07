const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true })); // בשביל form רגיל (application/x-www-form-urlencoded)
app.use(express.json()); // בשביל JSON
const cors = require("cors");
app.use(cors());
app.get("/", (req, res) => {
  res.send("Server Is Running");
});

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
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});