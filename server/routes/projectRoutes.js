import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { addProject, getAllProjects } from "../controllers/projectController.js";

const router = express.Router();

router.post("/add", verifyToken, isAdmin, addProject);
router.get("/all", verifyToken, getAllProjects);

export default router;