import db from '../config/db.js';
import nodemailer from 'nodemailer';


// 1. GET ALL USERS (Final Fix for 500 Error)
export const getAllUsers = async (req, res) => {
  // Force conversion to Integer
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const offset = (page - 1) * limit;

  try {
    // CHANGE: Use db.query instead of db.execute for better LIMIT/OFFSET support
    // The [limit, offset] must be passed as numbers
    const [rows] = await db.query(
      'SELECT id, full_name, email, designation, role, employee_id, status FROM users ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    // Get total count for your "Total Users" stat card
    const [totalRows] = await db.query('SELECT COUNT(*) as count FROM users');
    const totalCount = totalRows[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    // This sends the object your useEffect is already coded to receive
    res.status(200).json({
      users: rows,
      totalPages: totalPages,
      totalUsers: totalCount
    });

  } catch (error) {
    // This will show the error in your terminal so you can see why it's 500
    console.error("❌ DATABASE CRASH:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 2. ADD USER (Updated logic for Non-Employee & ID formatting)
export const addUser = async (req, res) => {
  const { full_name, email, password, isEmployee, isAdmin, designation } = req.body;
  
  try {
    let finalRole = 'employee';
    if (isAdmin) {
      finalRole = 'admin';
    } else if (!isEmployee && !isAdmin) {
      finalRole = 'non-employee';
    }

    // FIX: Use null instead of 'NA'
    let employee_id = null; 

    if (isEmployee) {
      // Filter out NULL and 'NA' to get the next count
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE employee_id IS NOT NULL AND employee_id != "NA"'
      );
      employee_id = rows[0].count + 1;
    }

    const sql = `INSERT INTO users (full_name, email, password, role, employee_id, designation) VALUES (?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [full_name, email, password, finalRole, employee_id, designation]);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Add User Error:", error.message);
    res.status(500).json({ error: error.message });
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
export const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, designation, role, status, password, employee_id } = req.body;

        // NEW LOGIC: 
        // 1. If there is a real ID (a number/string), we KEEP it.
        // 2. If the ID is "NA", empty, or missing, we save it as NULL.
        // This allows an Admin to keep their Employee ID if they have one.
        const finalEmployeeId = (employee_id && employee_id !== "NA" && employee_id !== "") 
            ? employee_id 
            : null;

        let sql;
        let params;

        if (password && password.trim() !== "") {
            sql = `UPDATE users SET full_name=?, email=?, designation=?, role=?, status=?, employee_id=?, password=? WHERE id=?`;
            params = [full_name, email, designation, role, status, finalEmployeeId, password, id];
        } else {
            sql = `UPDATE users SET full_name=?, email=?, designation=?, role=?, status=?, employee_id=? WHERE id=?`;
            params = [full_name, email, designation, role, status, finalEmployeeId, id];
        }

        const sanitizedParams = params.map(p => p === undefined ? null : p);

        await db.execute(sql, sanitizedParams);
        res.status(200).json({ message: "Update successful" });
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};
// 5. GET PENDING LOGS SUMMARY (New)
// 5. GET PENDING LOGS SUMMARY (Final Fix)
export const getPendingLogsSummary = async (req, res) => {
  try {
    // CHANGE: Filter by existence of employee_id. 
    // This includes anyone (Employee or Admin) who has a real numeric ID.
    const [users] = await db.execute(
      "SELECT id, full_name, email, employee_id FROM users WHERE employee_id IS NOT NULL AND employee_id != 'NA'"
    );
    
    // ... rest of the code remains the same ...
    
    // 2. Generate Mon-Fri dates for the last 14 days
    const businessDays = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
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

  // 1. SendGrid Setup
  const smtpUser = "apikey"; // Always 'apikey' for SendGrid
  const smtpPass = process.env.SENDGRID_API_KEY; // Your SG.xxx key
  const verifiedSender = process.env.SENDER_EMAIL; // e.g., 'your-email@gmail.com'

  if (!smtpPass || !verifiedSender) {
    return res.status(500).json({ 
      message: "SendGrid configuration missing in environment variables" 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false, // TLS
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const dateList = pendingDates.map(d => 
      `<li>${new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</li>`
    ).join('');

    const mailOptions = {
      // CRITICAL: The 'from' must be your Single Sender Verified email in SendGrid
      from: `"Worklog Admin" <${verifiedSender}>`,
      to: email,
      subject: 'Action Required: Pending Work Logs',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h3 style="color: #1d4ed8;">Hello,</h3>
          <p>This is a reminder to fill your work logs for the following dates:</p>
          <ul style="color: #b91c1c; font-weight: bold;">
            ${dateList}
          </ul>
          <p>Please complete your submissions via the dashboard as soon as possible.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
            Worklog Management System
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent via SendGrid" });

  } catch (error) {
    console.error("❌ SendGrid SMTP Error:", error.message);
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

//Pending reset request
export const getPendingResetRequests = async (req, res) => {
    try {
        // Updated query to use 'created_at' and the correct JOIN
        const sql = `
            SELECT pr.id, pr.email, pr.status, pr.created_at, u.full_name, u.id as user_id 
            FROM password_requests pr
            LEFT JOIN users u ON pr.email = u.email
            WHERE pr.status = 'Pending' 
            ORDER BY pr.created_at DESC`;

        const [rows] = await db.execute(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

//resolve reset req
export const resolveResetRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute(
            'UPDATE password_requests SET status = "Resolved" WHERE id = ?', 
            [id]
        );
        res.status(200).json({ message: "Request marked as resolved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};