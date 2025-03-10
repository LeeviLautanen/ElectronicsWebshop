const express = require("express");
const router = express.Router();
const pool = require("../db");
const sentry = require("../sentry");
const path = require("path");
const { SitemapStream } = require("sitemap");

router.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "../robots.txt"));
});

// Get offered shipping options
router.get("/sitemap.xml", async (req, res) => {
  try {
    const links = [
      { url: "/kauppa", changefreq: "daily" },
      { url: "/tietoa-meista", changefreq: "monthly" },
      { url: "/toimitusehdot", changefreq: "monthly" },
      { url: "/tietosuojaseloste", changefreq: "monthly" },
    ];

    const products = await pool.query("SELECT slug FROM products");
    products.rows.forEach((product) => {
      links.push({ url: `/kauppa/tuote/${product.slug}`, changefreq: "daily" });
    });

    const categories = await pool.query("SELECT name FROM categories");
    categories.rows.forEach((category) => {
      links.push({ url: `/kauppa/${category.name}`, changefreq: "daily" });
    });

    const stream = new SitemapStream({ hostname: "https://bittiboksi.fi" });

    res.header("Content-Type", "application/xml");

    // Stream the sitemap directly to the client
    links.forEach((link) => stream.write(link));
    stream.end();

    stream.pipe(res).on("error", (error) => {
      sentry.captureException(error);
      console.error(err);
      res.status(500).end();
    });
  } catch (error) {
    sentry.captureException(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
