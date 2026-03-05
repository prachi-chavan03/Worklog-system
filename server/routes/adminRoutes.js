import express from 'express';
// Change 'addEmployee' to 'addUser' here to match your controller
import { addUser, getAllUsers ,updateProfile ,updateUserProfile,informUser,getPendingLogsSummary,getUserById} from '../controllers/adminController.js';
import { addProject } from '../controllers/adminController.js';

const router = express.Router();

// Update the route to use 'addUser'
router.post('/add-user', addUser);
router.get('/users', getAllUsers);
router.put('/update-profile', updateProfile);
router.post('/add-project', addProject);
router.put('/update-user/:id', updateUserProfile);
router.get('/pending-logs-summary', getPendingLogsSummary);
router.post('/inform-user', informUser);
router.get('/users/:id', getUserById);

export default router;