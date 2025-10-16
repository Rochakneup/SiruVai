// controllers/supportticket.js
import { addTicket, getAllTickets, getTicketById, updateTicket, deleteTicket } from "../models/supportticket.js";


// Add new ticket
export const createTicket = async (req, res) => {
  try {
    const ticketData = req.body;

    // Auto-generate ticket_no
    ticketData.ticket_no = "TCK-" + Date.now();

    const newTicket = await addTicket(ticketData);
    res.status(201).json({ message: "Ticket created", data: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: error.message });
  }
};

// View all tickets
export const viewTickets = async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get ticket by ID
export const viewTicketById = async (req, res) => {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update ticket
export const editTicket = async (req, res) => {
  try {
    const updatedTicket = await updateTicket(req.params.id, req.body);
    if (!updatedTicket) return res.status(404).json({ error: "Ticket not found" });
    res.status(200).json({ message: "Ticket updated", data: updatedTicket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete ticket
export const removeTicket = async (req, res) => {
  try {
    const deletedTicket = await deleteTicket(req.params.id);
    if (!deletedTicket) return res.status(404).json({ error: "Ticket not found" });
    res.status(200).json({ message: "Ticket deleted", data: deletedTicket });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: error.message });
  }
};