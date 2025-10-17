import pool from "../db.js";

// Add a new product
export const addProduct = async ({ product_name, model_no, serial_no, brand_name }) => {
  const result = await pool.query(
    `INSERT INTO products (product_name, model_no, serial_no, brand_name)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [product_name, model_no, serial_no, brand_name]
  );
  return result.rows[0];
};

// Get all products
export const getProducts = async () => {
  const result = await pool.query(
    `SELECT p.*, b.brand_name 
     FROM products p 
     JOIN brands b ON p.brand_name = b.brand_name
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};