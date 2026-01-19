const mysql = require('mysql2');
const dbConfig = require("./db.config");

// Create a connection object using config values
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

// Connect to the database
connection.connect(error => {
  if (error) throw error; // stop the app if the connection fails
  console.log("Successfully connected to the database.");
});

// Export the connection so other files can use it
module.exports = connection;
