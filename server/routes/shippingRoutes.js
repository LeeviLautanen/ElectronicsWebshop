const express = require("express");
const router = express.Router();
const pool = require("../db");
const sentry = require("../sentry");

// Get offered shipping options
router.post("/shippingOptions", async (req, res) => {
  try {
    const { cartHeight, cartWeight } = req.body;

    const query = `
    SELECT public_id, name, description, delivery_time, image, price, max_weight_g, max_height_mm 
    FROM shipping_options 
    WHERE max_height_mm >= $1 AND max_weight_g >= $2
    `;
    const result = await pool.query(query, [cartHeight, cartWeight]);

    const shippingOptions = result.rows.map((option) => ({
      ...option,
      price: parseFloat(option.price),
    }));

    res.status(201).json(shippingOptions);
  } catch (error) {
    sentry.captureException(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
