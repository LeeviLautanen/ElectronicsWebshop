const express = require("express");
const router = express.Router();
const pool = require("../db");
const Sentry = require("@sentry/node");

// Get product data by slug
router.get("/products/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const result = await pool.query(
      "SELECT public_id, slug, name, description, image, price, stock, weight_g, height_mm FROM products WHERE slug = $1",
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
      "SELECT public_id, slug, name, description, image, price, stock, weight_g, height_mm FROM products"
    );
    res.status(201).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
