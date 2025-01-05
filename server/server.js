// Sentry error logging, has to be first (but dsn is in .env)
require("dotenv").config();
require("./sentry");

const Sentry = require("@sentry/node");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const developmentRoutes = require("./routes/developmentRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const seoRoutes = require("./routes/seoRoutes");

const app = express();
app.use(express.json());

const isDev = process.env.NODE_ENV !== "production";

// 4201 needed for product editor, etc
let allowedOrigins = [`http://localhost:4201`];

if (isDev) {
  allowedOrigins.push(`http://localhost:4200`);
  app.use("/api", developmentRoutes);
} else {
  allowedOrigins;
}

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", shippingRoutes);
app.use("/", seoRoutes);

// Serve product images with a default fallback
app.use("/uploads", (req, res, next) => {
  const filePath = path.join(__dirname, "uploads", req.path);
  const defaultImagePath = path.join(__dirname, "uploads", "no-image.webp");

  fs.access(filePath, fs.constants.F_OK, (err) => {
    // Serve default image if no image found with url
    if (err) {
      res.sendFile(defaultImagePath);
    } else {
      res.sendFile(filePath);
    }
  });
});

// Static files
app.use(express.static(path.join(__dirname, "./dist/browser")));

app.get("*", (req, res) => {
  if (req.path == "/404") {
    console.log(req.path);
    return res
      .status(404)
      .sendFile(path.join(__dirname, "./dist/browser/index.html"));
  }

  res.status(200).sendFile(path.join(__dirname, "./dist/browser/index.html"));
});

// Error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

const PORT = isDev ? process.env.PORT_DEV : process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
