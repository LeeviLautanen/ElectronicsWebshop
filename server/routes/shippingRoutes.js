const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get offered shipping options
router.get("/shipping", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT public_id, name, description, delivery_time, image, price, max_weight_g, max_height_mm FROM shippingOptions"
    );

    const shippingOptions = result.rows.map((option) => ({
      ...option,
      price: parseFloat(option.price),
    }));

    res.status(201).json(shippingOptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
