import pool from "../db.js";

// Get all users
export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users ORDER BY user_id ASC");
  return result.rows;
};

// Get single user
export const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
  return result.rows[0];
};

// Create new user
export const createUser = async (userData) => {
  const { username, password_hash, full_name, role, is_active } = userData;
  
  const query = `INSERT INTO users (username, password_hash, full_name, role, is_active) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  
  const result = await pool.query(query, [username, password_hash, full_name, role, is_active]);
  return result.rows[0];
};

// Update user
// Update user
export const updateUser = async (id, userData) => {
  const { username, password_hash, full_name, role, is_active } = userData;
  
  const result = await pool.query(
    `UPDATE users 
     SET username=$1, password_hash=$2, full_name=$3, role=$4, is_active=$5 
     WHERE user_id=$6 
     RETURNING *`,
    [username, password_hash, full_name, role, is_active, id]
  );
  
  return result.rows[0];
};


// Delete user
export const deleteUser = async (id) => {
  const result = await pool.query("DELETE FROM users WHERE user_id=$1", [id]);
  return result.rowCount;
};
