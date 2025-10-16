import express from "express";
import multer from "multer";
import path from "path";
import { createWarrantyCard, listWarrantyCards } from "../controller/warrantycontroller.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/warranty"); // Make sure folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.post("/add", upload.single("warranty_image"), createWarrantyCard);
router.get("/", listWarrantyCards);

export default router;
