const multer = require("multer");
const path = require("path");
const fs = require("fs");

const defaultDir = path.join(__dirname, "uploads");
const smallImageDir = path.join(__dirname, "uploads/small");
const largeImageDir = path.join(__dirname, "uploads/large");

// Make sure the directories exist
if (!fs.existsSync(defaultDir)) {
  fs.mkdirSync(defaultDir, { recursive: true });
}
if (!fs.existsSync(smallImageDir)) {
  fs.mkdirSync(smallImageDir, { recursive: true });
}
if (!fs.existsSync(largeImageDir)) {
  fs.mkdirSync(largeImageDir, { recursive: true });
}

// Define storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the folder based on the field name
    if (file.fieldname === "smallImage") {
      cb(null, smallImageDir);
    } else if (file.fieldname === "largeImage") {
      cb(null, largeImageDir);
    } else {
      cb(null, defaultDir);
    }
  },
  filename: (req, file, cb) => {
    try {
      const { slug } = JSON.parse(req.body.product);
      if (!slug) throw new Error("Failed uploading image: no slug");
      const fileName = `${slug}.webp`;
      cb(null, fileName);
    } catch (error) {
      cb(error);
    }
  },
});

const upload = multer({ storage });

module.exports = upload;
