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