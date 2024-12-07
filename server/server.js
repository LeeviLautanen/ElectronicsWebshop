const express = require("express");
const path = require("path");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(express.json());

const isDev = process.env.NODE_ENV === "development";

const PORT = isDev ? process.env.PORT_DEV : process.env.PORT;

app.use("/api", productRoutes);
app.use("/api", paymentRoutes);

// Static files
app.use(express.static(path.join(__dirname, "./dist/browser")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/browser/index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
