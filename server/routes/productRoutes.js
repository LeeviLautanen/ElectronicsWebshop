const express = require("express");
const router = express.Router();
const pool = require("../db");
const sentry = require("../sentry");
const upload = require("../upload.js");
const adminAuth = require("../adminAuth.js");
const stripe = require("../stripe");

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
    const {
      name,
      slug,
      description,
      image,
      price,
      stock,
      weight_g,
      height_mm,
    } = req.body;

    const insertQuery = `
      INSERT INTO products (name, slug, description, image, price, stock, weight_g, height_mm)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const insertValues = [
      name,
      slug,
      description,
      image,
      price,
      stock,
      weight_g,
      height_mm,
    ];

    const result = await pool.query(insertQuery, insertValues);

    await stripe.products.create({
      name: name,
      id: result.rows[0].public_id,
      default_price_data: {
        currency: "eur",
        tax_behavior: "inclusive",
        unit_amount: Math.round(parseFloat(price).toFixed(2) * 100),
      },
      url: `https://bittiboksi.fi/tuote/${slug}`,
      images: [`https://bittiboksi.fi/uploads/large/${image}`],
      tax_code: "txcd_99999999", // General tangible goods
      metadata: {
        public_id: result.rows[0].public_id,
        slug: slug,
        weight_g: weight_g,
        height_mm: height_mm,
      },
    });

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
          message: `Could not update data: no product found with public id ${public_id}`,
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

      // Get current stripe product and price
      const scaledPrice = Math.round(parseFloat(price).toFixed(2) * 100);

      // Create new product if it doesn't exist
      let stripeProduct;
      try {
        stripeProduct = await stripe.products.retrieve(public_id);
      } catch (error) {
        if (error.raw.code === "resource_missing") {
          await stripe.products.create({
            name: name,
            id: updatedResult.rows[0].public_id,
            default_price_data: {
              currency: "eur",
              tax_behavior: "inclusive",
              unit_amount: scaledPrice,
            },
            url: `https://bittiboksi.fi/tuote/${slug}`,
            images: [`https://bittiboksi.fi/uploads/large/${image}`],
            tax_code: "txcd_99999999", // General tangible goods
            metadata: {
              slug: slug,
              weight_g: weight_g,
              height_mm: height_mm,
            },
          });
        }
        return res.status(200).json(updatedResult.rows[0]);
      }

      // Generate new stripe product data
      const stripeProductData = {
        name: name,
        url: `https://bittiboksi.fi/tuote/${slug}`,
        images: [`https://bittiboksi.fi/uploads/large/${image}`],
        metadata: {
          slug: slug,
          weight_g: weight_g,
          height_mm: height_mm,
        },
      };

      const stripePrice = await stripe.prices.retrieve(
        stripeProduct.default_price
      );

      // If new price is different, create a new price
      if (scaledPrice !== stripePrice.unit_amount) {
        const newPrice = await stripe.prices.create({
          currency: "eur",
          unit_amount: scaledPrice,
          tax_behavior: "inclusive",
          product: public_id,
        });
        stripeProductData.default_price = newPrice.id;
      }

      // Update stripe product and then disable the old price (order matters)
      await stripe.products.update(public_id, stripeProductData);

      if (stripeProductData.default_price) {
        await stripe.prices.update(stripePrice.id, {
          active: false,
        });
      }

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

// Route for adding a new image manually
router.post("/images", adminAuth, upload.single("image"), (req, res) => {
  try {
    return res.status(200).send({ message: "Image uploaded" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
