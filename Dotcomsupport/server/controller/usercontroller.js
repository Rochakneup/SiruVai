import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../models/usermodels.js";

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addUser = async (req, res) => {
  try {
    // Debug: Log what we're receiving
    console.log('=== DEBUG INFO ===');
    console.log('req.body:', req.body);
    console.log('typeof req.body:', typeof req.body);
    console.log('req.headers:', req.headers);
    console.log('================');

    const { username, password_hash, full_name, role, is_active } = req.body;

    // Show what was extracted
    console.log('Extracted username:', username);
    console.log('Extracted password_hash:', password_hash);

    if (!username) {
      return res.status(400).json({ 
        error: "username is required",
        received_body: req.body,
        received_keys: Object.keys(req.body || {})
      });
    }

    if (!password_hash) {
      return res.status(400).json({ error: "password_hash is required" });
    }

    const newUser = await createUser({ 
      username, 
      password_hash, 
      full_name, 
      role, 
      is_active 
    });
    
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error in addUser:', err);
    res.status(500).json({ error: err.message });
  }
};

export const editUser = async (req, res) => {
  try {
    const { username, password_hash, full_name, role, is_active } = req.body;
    
    const updatedUser = await updateUser(req.params.id, {
      username,
      password_hash,
      full_name,
      role,
      is_active
    });
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const removeUser = async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};