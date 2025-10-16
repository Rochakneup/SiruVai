import pool from "../db.js";

// Add a new brand
export const addBrand = async (brand_name) => {
  const result = await pool.query(
    "INSERT INTO brands (brand_name) VALUES ($1) RETURNING *",
    [brand_name]
  );
  return result.rows[0];
};

// Get all brands
export const getBrands = async () => {
  const result = await pool.query(
    "SELECT * FROM brands ORDER BY created_at DESC"
  );
  return result.rows;
};
