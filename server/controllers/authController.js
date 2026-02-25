import db from "../config/db.js";
import jwt from "jsonwebtoken";

export const login = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server Error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const user = results[0];

    // 🔐 Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.full_name,
        role: user.role,
      },
    });
  });
};