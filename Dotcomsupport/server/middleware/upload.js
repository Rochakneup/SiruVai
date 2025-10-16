import multer from "multer";
import path from "path";
import fs from "fs";

const warrantyPath = path.join("uploads", "warranty");

// Ensure folder exists
if (!fs.existsSync(warrantyPath)) {
  fs.mkdirSync(warrantyPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, warrantyPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
