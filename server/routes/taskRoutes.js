import express from 'express';
import { getProjects, getUserLogs, saveDayEntry, submitWeeklySheet} from '../controllers/taskController.js';

const router = express.Router();

// This line must exist for the dashboard to load projects
router.get('/projects', getProjects); 

router.get('/get-logs/:userId', getUserLogs);
router.post('/save-day', saveDayEntry);
router.post('/submit-weekly', submitWeeklySheet);


export default router;