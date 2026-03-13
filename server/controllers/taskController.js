import db from '../config/db.js';

// 1. FETCH LOGS 
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const sql = `
            SELECT 
                u.full_name AS userName,
                u.email AS userEmail,
                u.role AS userRole,
                u.designation AS userDesignation,
                u.status AS userStatus,
                u.employee_id,
u.mobile AS userMobile,
                u.address AS userAddress,
                u.dob AS userDob,
                u.date_of_joining AS userDoj,
                u.skills AS userSkills,
                u.education AS userEducation,

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

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const responseData = {
            userName: rows[0].userName,
            userEmail: rows[0].userEmail,
            userRole: rows[0].userRole,
            userDesignation: rows[0].userDesignation,
            userStatus: rows[0].userStatus,
            userEmployeeId: rows[0].employee_id, 
userMobile: rows[0].userMobile,
            userAddress: rows[0].userAddress,
            userDob: rows[0].userDob,
            userDoj: rows[0].userDoj,
            userSkills: rows[0].userSkills,
            userEducation: rows[0].userEducation,

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

        const finalDescription = (day_type === "Working") ? (task_description || "") : null;
    
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
            finalDescription, 
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
            (log.day_type === "Working") ? (log.task_description || "") : null,
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

 // 5. Fetch logs for a specific user 
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