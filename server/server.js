const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:4200"],
  })
);

app.use(express.static(path.join(__dirname, "./dist/")));

// Mock response
app.get("/products/:slug", (req, res) => {
  slug = req.params.slug;
  console.log(slug);
  res.send({
    id: 192056,
    slug: "arduino-nano",
    name: "Arduino Nano",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue.",
    price: 4.99,
    imageUrl: "assets/test.jpg",
    stock: 1,
  });
});

app.get("/all", (req, res) => {
  res.send([
    {
      id: 192056,
      slug: "arduino-nano",
      name: "Arduino Nano",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue.",
      price: 4.99,
      imageUrl: "assets/test.jpg",
      stock: 1,
    },
    {
      name: "Ultraäänisensori",
      slug: "ultraäänisensori",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue. Donec sed imperdiet lacus.Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      id: 582454,
      price: 3.49,
      imageUrl: "assets/test.jpg",
      stock: 0,
    },
    {
      name: "N-mosfet IRF3205",
      slug: "n-mosfet-irf3205",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue. Donec sed imperdiet lacus.",
      id: 748515,
      price: 1.39,
      imageUrl: "assets/test.jpg",
      stock: 5,
    },
    {
      name: "P-mosfet IRF4095",
      slug: "p-mosfet-irf4905",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum non dolor eget consectetur. Donec dictum vitae risus quis congue. Donec sed imperdiet lacus.",
      id: 748515,
      price: 1.49,
      imageUrl: "assets/test.jpg",
      stock: 7,
    },
  ]);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
