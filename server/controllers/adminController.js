import db from '../config/db.js';

// 1. GET ALL USERS - This sends the data to your Dashboard Table
export const getAllUsers = async (req, res) => {
  try {
    // We select specific columns to keep it clean
    const [rows] = await db.execute(
      'SELECT id, full_name, email, role, status FROM users ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Fetch Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users from database" });
  }
};

// 2. ADD USER - Single unified function for adding any user type
export const addUser = async (req, res) => {
  const { full_name, email, password, role } = req.body;

  try {
    let employee_id = null; // Default is NULL

    // Only assign an ID if they are an employee
    if (role === 'employee') {
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "employee"');
      employee_id = rows[0].count + 1; 
    }

    const query = 'INSERT INTO users (full_name, email, password, role, employee_id) VALUES (?, ?, ?, ?, ?)';
    await db.execute(query, [full_name, email, password, role, employee_id]);

    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};
// Add to server/controllers/adminController.js
export const updateProfile = async (req, res) => {
  const { full_name, email, newPassword, originalEmail } = req.body;

  try {
    // 1. Update name and email
    let query = 'UPDATE users SET full_name = ?, email = ?';
    let params = [full_name, email];

    // 2. If a new password is provided, add it to the query
    if (newPassword && newPassword.trim() !== "") {
      query += ', password = ?';
      params.push(newPassword.trim());
    }

    // 3. Target the user by their original email (from session/token)
    query += ' WHERE email = ?';
    params.push(originalEmail);

    const [result] = await db.execute(query, params);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Profile updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during update" });
  }
};