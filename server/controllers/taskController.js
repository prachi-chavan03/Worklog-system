import db from '../config/db.js';


// 1. FETCH LOGS (Updated to include User Registration Details)
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // We now start FROM 'users' to ensure we get a result even if logs are empty
        const sql = `
            SELECT 
                u.full_name AS userName,
                u.email AS userEmail,
                u.role AS userRole,
                u.designation AS userDesignation,
                u.status AS userStatus, -- Added this to fetch user status
                wl.work_date, 
                wl.hours_worked, 
                wl.task_description, 
                wl.is_wfh, 
                wl.module_name,
                wl.day_type, 
                COALESCE(p.project_name, 'Others') AS project_name
            FROM users u
            LEFT JOIN work_logs wl ON u.id = wl.user_id
            LEFT JOIN projects p ON wl.project_id = p.id
            WHERE u.id = ?
            ORDER BY wl.work_date DESC`;

        const [rows] = await db.execute(sql, [userId]);

        // If no user is found at all in the users table
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Structure the response so the frontend can easily find user details
        const responseData = {
            userName: rows[0].userName,
            userEmail: rows[0].userEmail,
            userRole: rows[0].userRole,
            userDesignation: rows[0].userDesignation,
            userStatus: rows[0].userStatus, // <-- CRITICAL: Ensure this is here
            // If work_date is null, it means the LEFT JOIN found no logs
            logs: rows[0].work_date ? rows : [] 
        };

        res.status(200).json(responseData);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};


// 2. SAVE/UPDATE ENTRY
export const saveDayEntry = async (req, res) => {
    try {
        const { userId, project_name, module_name, work_date, hours_worked, task_description, is_wfh, day_type } = req.body;
        
        let projectId = null;
        if (project_name && project_name !== "Others" && project_name !== "N/A") {
            const [projects] = await db.execute('SELECT id FROM projects WHERE project_name = ?', [project_name]);
            if (projects.length > 0) projectId = projects[0].id;
        }

        // --- CHANGE START: Clear description if it's not a working day ---
        const finalDescription = (day_type === "Working") ? (task_description || "") : null;
        // --- CHANGE END ---

        const sql = `
            INSERT INTO work_logs 
                (user_id, project_id, module_name, work_date, hours_worked, task_description, is_wfh, day_type) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                project_id = VALUES(project_id), 
                module_name = VALUES(module_name),
                hours_worked = VALUES(hours_worked),
                task_description = VALUES(task_description),
                is_wfh = VALUES(is_wfh),
                day_type = VALUES(day_type)`; 
        
        await db.execute(sql, [
            userId, 
            projectId, 
            module_name || null, 
            work_date, 
            hours_worked, 
            finalDescription, // Use the cleared description here
            is_wfh ? 1 : 0,
            day_type || "Working" 
        ]);

        res.status(200).json({ success: true, message: "Entry updated successfully" });
    } catch (err) {
        console.error("Save Error:", err.message);
        res.status(500).json({ error: "Failed to save entry" });
    }
};

// 3. GET PROJECTS
export const getProjects = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, project_name FROM projects');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. SUBMIT WEEKLY SHEET
export const submitWeeklySheet = async (req, res) => {
    try {
        const { userId, logs } = req.body;
        if (!logs || logs.length === 0) return res.status(400).json({ error: "No data" });

        const [dbProjects] = await db.execute('SELECT id, project_name FROM projects');
        const projectMap = {};
        dbProjects.forEach(p => projectMap[p.project_name] = p.id);

        const values = logs.map(log => [
            userId,
            (log.project_name === "Others" || log.project_name === "N/A") ? null : (projectMap[log.project_name] || null),
            log.module_name || null,
            log.work_date,
            log.hours_worked,
            // --- CHANGE START: Clear description for non-working days in bulk submit ---
            (log.day_type === "Working") ? (log.task_description || "") : null,
            // --- CHANGE END ---
            log.is_wfh ? 1 : 0,
            log.day_type || "Working"
        ]);

        const logSql = `INSERT INTO work_logs (user_id, project_id, module_name, work_date, hours_worked, task_description, is_wfh, day_type) 
                        VALUES ? ON DUPLICATE KEY UPDATE 
                        project_id=VALUES(project_id), 
                        module_name=VALUES(module_name),
                        hours_worked=VALUES(hours_worked), 
                        task_description=VALUES(task_description),
                        is_wfh=VALUES(is_wfh),
                        day_type=VALUES(day_type)`; 
        
        await db.query(logSql, [values]);

        const firstDate = new Date(logs[0].work_date);
        const year = firstDate.getFullYear();
        const oneJan = new Date(year, 0, 1);
        const weekNumber = Math.ceil((((firstDate - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);

        const subSql = `INSERT INTO weekly_submissions (user_id, week_number, year) VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE submitted_at = CURRENT_TIMESTAMP`;
        await db.execute(subSql, [userId, weekNumber, year]);

        res.status(200).json({ success: true, message: "Timesheet saved successfully!" });
    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({ error: "Submission failed" });
    }
};

// 5.update-user logic with this:
export const updateUserProfile = async (req, res) => {
    try {
        // 1. Get ID from params
        const { id } = req.params; 
        
        // 2. Get data from body
        const { full_name, email, designation, role, status, password } = req.body;

        // DEBUG: This will show you exactly which one is 'undefined' in your terminal
        console.log("DEBUG VALUES:", { id, full_name, email, status });

        if (!id || id === 'undefined') {
            return res.status(400).json({ error: "User ID is required and cannot be undefined" });
        }

        let sql;
        let params;

        if (password && password.trim() !== "") {
            sql = `UPDATE users SET full_name = ?, email = ?, designation = ?, role = ?, status = ?, password = ? WHERE id = ?`;
            // Use || fallbacks to prevent 'undefined'
            params = [
                full_name || '', 
                email || '', 
                designation || '', 
                role || 'Employee', 
                status || 'active', 
                password, 
                id
            ];
        } else {
            sql = `UPDATE users SET full_name = ?, email = ?, designation = ?, role = ?, status = ? WHERE id = ?`;
            params = [
                full_name || '', 
                email || '', 
                designation || '', 
                role || 'Employee', 
                status || 'active', 
                id
            ];
        }

        const [result] = await db.execute(sql, params);
        res.status(200).json({ message: "Success" });

    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};
//Fetch logs for a specific user 
export const getUserLogs = async (req, res) => {
    try {
        const { userId } = req.params;
        const sql = `
            SELECT 
                wl.work_date, 
                wl.hours_worked, 
                wl.task_description, 
                wl.is_wfh, 
                wl.module_name,
                wl.day_type, 
                COALESCE(p.project_name, 'Others') AS project_name
            FROM work_logs wl
            LEFT JOIN projects p ON wl.project_id = p.id
            WHERE wl.user_id = ?
            ORDER BY wl.work_date DESC`;

        const [rows] = await db.execute(sql, [userId]);
        res.status(200).json(rows);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};