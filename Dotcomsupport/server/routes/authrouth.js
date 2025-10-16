import express from "express";
import { login } from "../controller/authcontroller.js";

const router = express.Router();

router.post("/login", login);

export default router;
