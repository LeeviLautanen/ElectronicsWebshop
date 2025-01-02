const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "uploads");

// Make sure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save directory
  },
  filename: (req, file, cb) => {
    // Generate a file name based on the slug
    const { slug } = JSON.parse(req.body.product);
    const fileName = `${slug}.jpg`;

    // Check if the file already exists and delete it if it does
    const filePath = path.join(uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    cb(null, fileName);
  },
});

// Filters
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only images are allowed"), false);
  }
  cb(null, true);
};

// Options
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // Limit file size to 1 MB
  fileFilter,
});

module.exports = upload;
