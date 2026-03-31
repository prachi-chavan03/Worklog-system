import db from '../config/db.js';
import sgMail from '@sendgrid/mail';


// 1. GET ALL USERS (Consolidated with Global Search)

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


// 2. ADD USER
export const addUser = async (req, res) => {
  const { full_name, email, password, isEmployee, isAdmin, designation, mobile, address, dob, date_of_joining, skills, education } = req.body;
  
  try {
    let finalRole = 'employee';
    if (isAdmin) {
      finalRole = 'admin';
    } else if (!isEmployee && !isAdmin) {
      finalRole = 'non-employee';
    }

    let employee_id = null; 

    if (isEmployee) {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE employee_id IS NOT NULL AND employee_id != "NA"'
      );
      employee_id = rows[0].count + 1;
    }

    const sql = `INSERT INTO users (full_name, email, password, role, employee_id, designation, mobile, address, dob, date_of_joining, skills, education) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      full_name, email, password, finalRole, employee_id, designation,
      mobile || null,
      address || null,
      (dob === "" || !dob ? null : dob),
      (date_of_joining === "" || !date_of_joining ? null : date_of_joining),
      skills || null,
      education || null
    ];

    await db.execute(sql, params);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Add User Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 3. UPDATE PROFILE (Added designation to update logic)
export const updateProfile = async (req, res) => {
  const { 
    full_name, email, designation, newPassword, originalEmail,
    mobile, address, dob, date_of_joining, skills, education 
  } = req.body; 

  try {
    let query = `
      UPDATE users SET 
        full_name = ?, email = ?, designation = ?, 
        mobile = ?, address = ?, dob = ?, 
        date_of_joining = ?, skills = ?, education = ?
    `;
    let params = [
      full_name, email, designation || null,
      mobile || null, address || null, (dob === "" ? null : dob),
      (date_of_joining === "" ? null : date_of_joining), skills || null, education || null
    ];

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

// 4. ADD PROJECT 
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

//5. UPDATE USER PROFILE (Admin Edit) 
export const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, designation, role, status, password, employee_id,mobile, address, dob, date_of_joining, skills, education } = req.body;

        const finalEmployeeId = (employee_id && employee_id !== "NA" && employee_id !== "") 
            ? employee_id 
            : null;

        let sql;
        let params;
const commonFields = `
            full_name=?, email=?, designation=?, role=?, status=?, employee_id=?, 
            mobile=?, address=?, dob=?, date_of_joining=?, skills=?, education=?
        `;
        
        const commonParams = [
            full_name, email, designation, role, status, finalEmployeeId,
            mobile || null, 
            address || null, 
            (dob === "" ? null : dob), 
            (date_of_joining === "" ? null : date_of_joining), 
            skills || null, 
            education || null
        ];

        if (password && password.trim() !== "") {
            sql = `UPDATE users SET ${commonFields}, password=? WHERE id=?`;
            params = [...commonParams, password.trim(), id];
        } else {
            sql = `UPDATE users SET ${commonFields} WHERE id=?`;
            params = [...commonParams, id];
        }

        await db.execute(sql, params);
        res.status(200).json({ message: "Update successful" });
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};


// 6. GET PENDING LOGS SUMMARY (Final Fix)
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
    for (let i = 1; i < 11; i++) {
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

  // Set API Key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const verifiedSender = process.env.SENDER_EMAIL;

  if (!process.env.SENDGRID_API_KEY || !verifiedSender) {
    return res.status(500).json({ message: "SendGrid config missing" });
  }

  try {
    const dateList = pendingDates.map(d => 
      `<li>${new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</li>`
    ).join('');

    const msg = {
      to: email,
      from: verifiedSender, // Must be verified in SendGrid Dashboard
      subject: 'Action Required: Pending Work Logs',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h3 style="color: #1d4ed8;">Hello,</h3>
          <p>This is a reminder to fill your work logs for the following dates:</p>
          <ul style="color: #b91c1c; font-weight: bold;">
            ${dateList}
          </ul>
          <hr />
          <p style="font-size: 11px; color: #999;">Worklog Management System</p>
        </div>
      `,
    };

    // ✅ SUCCESS: This sends via HTTP API (Port 443), bypassing the Render block!
    await sgMail.send(msg);
    
    res.status(200).json({ success: true, message: "Email sent successfully via API" });

  } catch (error) {
    // SendGrid error objects are deep, this helps you see the real reason for failure
    const errorMessage = error.response ? error.response.body.errors[0].message : error.message;
    console.error("❌ SendGrid API Error:", errorMessage);
    res.status(500).json({ message: "Failed to send email", details: errorMessage });
  }
};
// 7. GET SINGLE USER BY ID (Fixes the 404 & JSON error)
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(
      'SELECT id, full_name, email, designation, role, employee_id ,mobile, address, dob, date_of_joining, skills, education FROM users WHERE id = ?',
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

// NEW: Dedicated Search Controller
export const searchUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const searchTerm = req.query.search || "";
  const offset = (page - 1) * limit;

  try {
    // This query does two things:
    // 1. WHERE: It hides anyone who doesn't match the search (Nikhil will be hidden)
    // 2. ORDER BY CASE: It puts "Starts With" matches at the top (Sadhana moves to #1)
    const [rows] = await db.query(
      `SELECT id, full_name, email, designation, role, employee_id, status 
       FROM users 
       WHERE (full_name LIKE ? OR email LIKE ?)
       ORDER BY 
         (CASE 
            WHEN full_name LIKE ? THEN 1 -- Starts with 'S'
            ELSE 2                       -- Contains 'S' anywhere else
          END), 
         full_name ASC 
       LIMIT ? OFFSET ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `${searchTerm}%`, limit, offset]
    );

    const [totalRows] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE full_name LIKE ? OR email LIKE ?',
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );

    res.status(200).json({
      users: rows,
      totalPages: Math.ceil(totalRows[0].count / limit),
      totalUsers: totalRows[0].count
    });
  } catch (error) {
    console.error("Search Logic Error:", error.message);
    res.status(500).json({ message: "Search failed" });
  }
};