// controllers/authController.js
import db from "../db.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login attempt:", username, password);

    const result = await db.query(
      "SELECT * FROM users WHERE username = $1 AND password_hash = $2",
      [username, password]
    );

    console.log("Query result:", result.rows);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error in login controller:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};