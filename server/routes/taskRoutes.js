import express from 'express';
import { getProjects, getUserDetails, saveDayEntry, submitWeeklySheet,getUserLogs} from '../controllers/taskController.js';

const router = express.Router();

// This line must exist for the dashboard to load projects
router.get('/projects', getProjects); 

router.get('/get-user-info/:userId', getUserDetails);
router.post('/save-day', saveDayEntry);
router.post('/submit-weekly', submitWeeklySheet);
router.get('/get-logs/:userId', getUserLogs);

export default router;