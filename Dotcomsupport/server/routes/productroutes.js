import express from "express";
import { createProduct, listProducts } from "../controller/productcontroller.js";

const router = express.Router();

// Add a new product
router.post("/add", createProduct);

// List all products
router.get("/", listProducts);

export default router;
