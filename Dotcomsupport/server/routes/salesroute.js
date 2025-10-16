import express from "express";
import { createSale, listSales } from "../controller/salescontroller.js";

const router = express.Router();

router.post("/add", createSale);
router.get("/", listSales);

export default router;
