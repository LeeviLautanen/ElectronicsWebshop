const express = require("express");
const router = express.Router();
const pool = require("../db");

// Add product
router.post("/products", async (req, res) => {
  const { slug, name, description, image, price, stock, weight, height } =
    req.body;

  try {
    const result = await pool.query(
      "INSERT INTO products (slug, name, description, image, price, stock, weight_g, height_mm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [slug, name, description, image, price, stock, weight, height]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
