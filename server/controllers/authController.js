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

    // --- STEP 1 CHANGE START: ACCOUNT STATUS CHECK ---
    // We check if the status is 'inactive' (case-insensitive check)
    if (user.status && user.status.toLowerCase() === 'inactive') {
      return res.status(403).json({ 
        message: "Your account is deactivated. Please contact the administrator." 
      });
    }

    // 2. Compare plain-text passwords (with trimming)
    if (password.trim() !== user.password.trim()) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate Token with Role
    const secret = process.env.JWT_SECRET || 'emergency_secret_123';
    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: '12h' }
    );

    // 4. Send response including the ROLE and DESIGNATION
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        designation: user.designation // ADDED THIS LINE
      }
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        // 1. Check if user exists
        const [user] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            // We return 200 but don't do anything (Security Best Practice) 
            // OR return an error if you want to be direct:
            return res.status(404).json({ message: "Email not registered" });
        }

        // 2. Insert request into the admin notification table
        await db.execute(
            'INSERT INTO password_requests (email) VALUES (?)', 
            [email]
        );

        res.status(200).json({ success: true, message: "Admin informed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};