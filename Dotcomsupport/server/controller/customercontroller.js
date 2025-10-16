import { addCustomer, getCustomers } from "../models/customermodel.js";

// POST /customers → add a new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phone_no, address, email } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const customer = await addCustomer({ name, phone_no, address, email });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /customers → get all customers
export const listCustomers = async (req, res) => {
  try {
    const customers = await getCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
