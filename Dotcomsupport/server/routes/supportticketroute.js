// routes/supportticket.js
import express from "express";
import { createTicket, viewTickets, viewTicketById, editTicket, removeTicket } from "../controller/supportticketcontroller.js";

const router = express.Router();

router.post("/add", createTicket);
router.get("/view", viewTickets);
router.get("/view/:id", viewTicketById);
router.put("/update/:id", editTicket);
router.delete("/delete/:id", removeTicket);  // Add this route

export default router;