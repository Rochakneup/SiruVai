import pool from "../db.js";

// ✅ Get all customers
export const getCustomers = async () => {
  const result = await pool.query(`SELECT * FROM customers ORDER BY customer_id DESC`);
  return result.rows;
};

// ✅ Get customer by name or phone number
export const getCustomerByNameOrPhone = async (name, phone_no) => {
  const result = await pool.query(
    `SELECT * FROM customers WHERE name = $1 OR phone_no = $2 LIMIT 1`,
    [name, phone_no]
  );
  return result.rows[0];
};

// ✅ Add new customer
export const addCustomer = async ({ name, phone_no, address, email }) => {
  const result = await pool.query(
    `INSERT INTO customers (name, phone_no, address, email)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, phone_no, address, email]
  );
  return result.rows[0];
};
