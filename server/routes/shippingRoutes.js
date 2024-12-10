const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get product data by slug
router.get("/shipping", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, description, delivery_time, image, price, max_weight_g, max_height_mm FROM shippingOptions"
    );
    res.status(201).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
