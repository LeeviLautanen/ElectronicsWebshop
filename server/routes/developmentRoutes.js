const express = require("express");
const router = express.Router();
const pool = require("../db");
const Sentry = require("../sentry");

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

// Sentry test route
router.get("/sentry-test", async (req, res) => {
  try {
    throw new Error("Sentry works");
  } catch (error) {
    Sentry.captureException(error);
    res.status(400).json({ result: "Sentry test" });
  }
});

module.exports = router;
