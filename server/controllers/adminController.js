import db from '../config/db.js';

// 1. GET ALL USERS (Added designation to selection)
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, full_name, email, designation, role, employee_id FROM users ORDER BY id DESC'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Fetch Users Error:", error.message);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// 2. ADD USER (Added designation to insertion)
export const addUser = async (req, res) => {
  const { full_name, email, password, role, designation } = req.body; // Added designation
  try {
    let employee_id = null;
    if (role === 'employee') {
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "employee"');
      employee_id = rows[0].count + 1; 
    }

    // Updated query to include designation column
    const query = 'INSERT INTO users (full_name, email, password, role, employee_id, designation) VALUES (?, ?, ?, ?, ?, ?)';
    await db.execute(query, [full_name, email, password, role, employee_id, designation || null]);
    
    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("❌ Add User Error:", error.message);
    res.status(500).json({ message: "Database error" });
  }
};

// 3. UPDATE PROFILE (Added designation to update logic)
export const updateProfile = async (req, res) => {
  const { full_name, email, designation, newPassword, originalEmail } = req.body; // Added designation
  try {
    // Added designation = ? to the base query
    let query = 'UPDATE users SET full_name = ?, email = ?, designation = ?';
    let params = [full_name, email, designation || null];

    if (newPassword && newPassword.trim() !== "") {
      query += ', password = ?';
      params.push(newPassword.trim());
    }

    query += ' WHERE email = ?';
    params.push(originalEmail);

    const [result] = await db.execute(query, params);
    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Profile updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("❌ Update Profile Error:", error.message);
    res.status(500).json({ message: "Server error during update" });
  }
};

// 4. ADD PROJECT (For Project Hub) - Remaining unchanged
export const addProject = async (req, res) => {
  try {
    const { project_name } = req.body;
    if (!project_name) return res.status(400).json({ message: "Project name is required" });

    const [existing] = await db.execute('SELECT id FROM projects WHERE project_name = ?', [project_name]);
    if (existing.length > 0) return res.status(409).json({ message: "Project already exists" });

    await db.execute('INSERT INTO projects (project_name) VALUES (?)', [project_name]);
    res.status(201).json({ success: true, message: "Project added successfully" });
  } catch (err) {
    console.error("❌ Add Project Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// update user profile by admin only
export const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        // Added 'status' to the destructured body
        const { full_name, email, designation, role, status, password } = req.body;

        let sql;
        let params;

        // If password is provided, include it in the update (along with status)
        if (password && password.trim() !== "") {
            sql = `UPDATE users SET full_name = ?, email = ?, designation = ?, role = ?, status = ?, password = ? WHERE id = ?`;
            params = [full_name, email, designation, role, status, password, id];
        } else {
            // Otherwise, update profile information including the new status
            sql = `UPDATE users SET full_name = ?, email = ?, designation = ?, role = ?, status = ? WHERE id = ?`;
            params = [full_name, email, designation, role, status, id];
        }

        const [result] = await db.execute(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User profile updated successfully" });
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 5. GET PENDING LOGS SUMMARY (New)
export const getPendingLogsSummary = async (req, res) => {
  try {
    // 1. Fetch employees (exclude admins)
    const [users] = await db.execute(
      "SELECT id, full_name, email, employee_id FROM users WHERE role != 'admin'"
    );
    
    // 2. Generate Mon-Fri dates for the last 14 days
    const businessDays = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      let d = new Date();
      d.setDate(today.getDate() - i);
      let dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sat/Sun
        businessDays.push(d.toISOString().split('T')[0]);
      }
    }

    if (businessDays.length === 0) return res.json([]);

    const pendingSummary = [];

    for (const user of users) {
      // ✅ FIX: Changed 'logs' to 'work_logs' to match your schema
      const [entries] = await db.query(
        "SELECT work_date FROM work_logs WHERE user_id = ? AND work_date IN (?)",
        [user.id, businessDays]
      );

      // Normalize DB dates to YYYY-MM-DD string for comparison
      const savedDates = entries.map(row => {
        const d = new Date(row.work_date);
        return d.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
      });

      const missingDates = businessDays.filter(date => !savedDates.includes(date));

      if (missingDates.length > 0) {
        pendingSummary.push({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          missing_count: missingDates.length,
          missing_dates: missingDates.sort() // Keeps them in order
        });
      }
    }
    
    res.status(200).json(pendingSummary);
  } catch (error) {
    console.error("❌ Pending Logs Logic Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 6. INFORM USER (New)
export const informUser = async (req, res) => {
  const { email, pendingDates } = req.body;

  // DEBUG: Check if variables are loaded
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "EXISTS" : "MISSING");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ 
      message: "Email credentials not configured in server .env file" 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // ... rest of your mailOptions and sendMail code

    // Formatting dates for a clean HTML list
    const dateList = pendingDates.map(d => 
      `<li>${new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</li>`
    ).join('');

    const mailOptions = {
      from: `"Worklog Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Action Required: Pending Work Logs',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h3>Hello,</h3>
          <p>This is a reminder to fill your work logs for the following dates:</p>
          <ul style="color: #d32f2f; font-weight: bold;">
            ${dateList}
          </ul>
          <p>Please complete your submissions as soon as possible.</p>
          <hr />
          <p style="font-size: 12px; color: #777;">Worklog Management System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    // Check your terminal for this specific error message
    console.error("❌ Nodemailer Error:", error.message);
    res.status(500).json({ message: "Failed to send email", details: error.message });
  }
};

// 7. GET SINGLE USER BY ID (Fixes the 404 & JSON error)
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(
      'SELECT id, full_name, email, designation, role, employee_id FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("❌ Fetch User By ID Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};