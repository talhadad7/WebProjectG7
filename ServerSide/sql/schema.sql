-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS butterlab
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE butterlab;

-- Table for contact form messages from users
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- when the message was sent
);

-- Table for products sold in the website
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(60) PRIMARY KEY, -- usually a unique string or slug
  name VARCHAR(150) NOT NULL,
  flavor VARCHAR(200),
  description TEXT,
  price DECIMAL(10,2) NOT NULL, -- product price
  weight INT, -- product weight (for display)
  image VARCHAR(255), -- product image path
  alt VARCHAR(255), -- alt text for accessibility / SEO
  popularity INT DEFAULT 0 -- can be used to sort best sellers
);

-- Table for customer orders (shipping details)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  zip VARCHAR(20),
  notes TEXT, -- extra info from the customer
  total DECIMAL(10,2) NOT NULL, -- total price of the order
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Items inside each order (connects orders with products)
CREATE TABLE IF NOT EXISTS order_items (
  order_id INT NOT NULL,
  product_id VARCHAR(60) NOT NULL,
  quantity INT NOT NULL, -- how many units of the product
  unit_price DECIMAL(10,2) NOT NULL, -- price per unit at the time of purchase
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, -- delete items if order is deleted
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT -- product cannot be deleted if used in an order
);
