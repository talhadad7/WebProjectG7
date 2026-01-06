const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true })); // בשביל form רגיל (application/x-www-form-urlencoded)
app.use(express.json()); // בשביל JSON

app.get("/", (req, res) => {
  res.send("Server Is Runnding");
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});