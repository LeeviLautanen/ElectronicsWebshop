const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get product data by slug
router.get("/products/:slug", async (req, res) => {
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
router.get("/products", async (req, res) => {
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
router.post("/products", async (req, res) => {
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

module.exports = router;
