const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:4200",
    })
  );
}

// Static files
app.use(express.static(path.join(__dirname, "./dist/browser")));

// Mock response
app.get("/api/products/:slug", (req, res) => {
  slug = req.params.slug;
  console.log(slug);
  if (slug == "arduino-nano")
    res.send({
      id: 192056,
      slug: "arduino-nano",
      name: "Arduino Nano",
      image: "arduino-nano.jpg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue.",
      price: 4.99,
      stock: 1,
    });
  else {
    res.send({
      id: 582454,
      slug: "ultraäänisensori",
      name: "Ultraäänisensori",
      image: "no-image.jpg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue. Donec sed imperdiet lacus.Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: 3.49,
      stock: 0,
    });
  }
});

// Mock data
app.get("/api/allProducts", (req, res) => {
  res.send([
    {
      id: 192056,
      name: "Arduino Nano",
      slug: "arduino-nano",
      image: "arduino-nano.jpg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue.",
      price: 4.99,
      stock: 1,
    },
    {
      id: 582454,
      name: "Ultraäänisensori",
      slug: "ultraäänisensori",
      image: "no-image.jpg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue. Donec sed imperdiet lacus.Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      price: 3.49,
      stock: 0,
    },
    {
      id: 748515,
      name: "N-mosfet IRF3205",
      slug: "n-mosfet-irf3205",
      image: "no-image.jpg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue. Donec sed imperdiet lacus.",
      price: 1.39,
      stock: 5,
    },
    {
      id: 145661,
      name: "P-mosfet IRF4095",
      slug: "p-mosfet-irf4905",
      image: "no-image.jpg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue. Donec sed imperdiet lacus.",
      price: 1.49,
      stock: 7,
    },
  ]);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/browser/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
