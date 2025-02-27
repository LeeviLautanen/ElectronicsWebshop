const express = require("express");
const router = express.Router();
const pool = require("../db");
const sentry = require("../sentry");
const upload = require("../upload.js");
const adminAuth = require("../adminAuth.js");

// Get product data by slug
router.get("/products/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const result = await pool.query(
      "SELECT public_id, slug, name, description, image, price, stock, weight_g, height_mm FROM products WHERE slug = $1",
      [slug]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    sentry.captureException(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM categories ORDER BY sort_order ASC"
    );
    res.status(201).json(result.rows);
  } catch (error) {
    sentry.captureException(error);
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
router.get("/categories/:name", async (req, res) => {
  try {
    const categoryName = req.params.name;
    const result = await pool.query(
      `SELECT public_id, name, slug, description, image, price, stock, weight_g, height_mm 
       FROM products 
       WHERE category_id = (SELECT id FROM categories WHERE name = $1) 
       ORDER BY name ASC`,
      [categoryName]
    );

    res.status(201).json(result.rows);
  } catch (error) {
    sentry.captureException(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, category_id, public_id, name, slug, description, image, price, stock, weight_g, height_mm FROM products ORDER BY id DESC"
    );
    res.status(201).json(result.rows);
  } catch (error) {
    sentry.captureException(error);
    res.status(500).json(error);
  }
});

// Add a new product
router.post("/products", adminAuth, async (req, res) => {
  try {
    const insertQuery = `
      INSERT INTO products (name, slug, description, image, price, stock, weight_g, height_mm)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const insertValues = [
      req.body.name,
      req.body.slug,
      req.body.description,
      req.body.image,
      req.body.price,
      req.body.stock,
      req.body.weight_g,
      req.body.height_mm,
    ];

    const result = await pool.query(insertQuery, insertValues);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json({ error: error.message });
  }
});

// Update product data
router.put(
  "/products",
  adminAuth,
  upload.fields([
    { name: "smallImage", maxCount: 1 },
    { name: "largeImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        image,
        price,
        stock,
        weight_g,
        height_mm,
        category_id,
        public_id,
      } = JSON.parse(req.body.product);

      const existingResult = await pool.query(
        "SELECT id FROM products WHERE public_id = $1",
        [public_id]
      );

      if (existingResult.rowCount === 0) {
        return res.status(404).json({
          message: `Could not update data: no product found with public id: ${public_id}`,
        });
      }

      const updateQuery = `
      UPDATE products
      SET name = $1, slug = $2, description = $3, image = $4, price = $5, stock = $6, weight_g = $7, height_mm = $8, category_id = $9
      WHERE public_id = $10
      RETURNING *
    `;
      const updateValues = [
        name,
        slug,
        description,
        image,
        price,
        stock,
        weight_g,
        height_mm,
        category_id,
        public_id,
      ];

      const updatedResult = await pool.query(updateQuery, updateValues);

      return res.status(200).json(updatedResult.rows[0]);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
);

// Delete a product by public ID
router.delete("/products/:public_id", adminAuth, async (req, res) => {
  try {
    const public_id = req.params.public_id;
    const deleteQuery = "DELETE FROM products WHERE public_id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [public_id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: `No product found with public id: ${public_id}` });
    }

    return res
      .status(200)
      .json({ message: "Product deleted", product: result.rows[0] });
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json({ error: error.message });
  }
});

// Add a new image manually
router.post("/images", adminAuth, upload.single("image"), (req, res) => {
  try {
    return res.status(200).send({ message: "Image uploaded" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
