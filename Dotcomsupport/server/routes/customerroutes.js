import express from "express";
import { createCustomer, listCustomers } from "../controller/customercontroller.js";


const router = express.Router();

// Add a new customer
router.post("/add", createCustomer);

// List all customers
router.get("/", listCustomers);

// ✅ Export default
export default router;
