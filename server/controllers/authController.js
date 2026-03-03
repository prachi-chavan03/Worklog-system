import db from '../config/db.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const query = 'SELECT * FROM users WHERE TRIM(email) = ?';
    const [rows] = await db.execute(query, [email.trim()]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // 2. Compare plain-text passwords (with trimming)
    if (password.trim() !== user.password.trim()) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate Token with Role
    const secret = process.env.JWT_SECRET || 'emergency_secret_123';
    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    // 4. Send response including the ROLE and DESIGNATION
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        designation: user.designation // ADDED THIS LINE
      }
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};