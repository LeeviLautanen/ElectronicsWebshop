// Sentry error logging, has to be first (but dsn is in .env)
require("dotenv").config();
require("./sentry");

const Sentry = require("@sentry/node");
const express = require("express");
const path = require("path");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const developmentRoutes = require("./routes/developmentRoutes");

const app = express();
app.use(express.json());

const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  app.use(
    cors({
      origin: `http://localhost:4200`,
    })
  );
  app.use("/api", developmentRoutes);
}

app.use("/api", productRoutes);
app.use("/api", paymentRoutes);
app.use("/api", shippingRoutes);

// Static files
app.use(express.static(path.join(__dirname, "./dist/browser")));

// Default route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/browser/index.html"));
});

// Error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

const PORT = isDev ? process.env.PORT_DEV : process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
