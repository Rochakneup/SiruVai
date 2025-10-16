import express from "express";
import { createBrand, listBrands } from "../controller/brandcontroller.js";

const router = express.Router();

// Add a new brand
router.post("/add", createBrand);

// List all brands
router.get("/", listBrands);

export default router;
