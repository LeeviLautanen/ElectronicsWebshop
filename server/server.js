const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  app.use(
    cors({
      origin: "http://localhost:4200",
    })
  );
}

// Postgres connection
const pool = new Pool({
  host: isDev ? process.env.DB_HOST_DEV : process.env.DB_HOST,
  database: isDev ? process.env.DB_NAME_DEV : process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Connected to the database successfully");
  }
});

// Static files
app.use(express.static(path.join(__dirname, "./dist/browser")));

// Get product data by slug
app.get("/api/products/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const result = await pool.query(
      "SELECT name, slug, description, image, price, stock FROM products WHERE slug = $1",
      [slug]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, slug, description, image, price, stock FROM products"
    );
    res.status(201).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product
app.post("/api/products", async (req, res) => {
  const { slug, name, description, image, price, stock } = req.body;
  console.log(req.body);

  try {
    const result = await pool.query(
      "INSERT INTO products (slug, name, description, image, price, stock) VALUES ($1, $2, $3, $4, $5, $6)",
      [slug, name, description, image, price, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/browser/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
