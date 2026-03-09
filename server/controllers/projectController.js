import db from "../config/db.js";

/* ===============================
   ADMIN - ADD PROJECT
================================ */
const addProject = (req, res) => {
  const { project_name } = req.body;

  if (!project_name || project_name.trim() === "") {
    return res.status(400).json({ message: "Project name is required" });
  }

  const sql = `
    INSERT INTO projects (project_name)
    VALUES (?)
  `;

  db.query(sql, [project_name.trim()], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Project already exists" });
      }
      console.error(err);
      return res.status(500).json({ message: "Failed to add project" });
    }

    res.status(201).json({
      message: "Project added successfully",
      project: {
        id: result.insertId,
        project_name: project_name.trim()
      }
    });
  });
};

/* ===============================
   GET ALL PROJECTS
================================ */
const getAllProjects = (req, res) => {
  const sql = `
    SELECT id, project_name
    FROM projects
    ORDER BY project_name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch projects" });
    }

    res.json(result);
  });
};

export { addProject, getAllProjects };