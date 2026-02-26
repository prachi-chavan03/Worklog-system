import express from 'express';
// Change 'addEmployee' to 'addUser' here to match your controller
import { addUser, getAllUsers ,updateProfile } from '../controllers/adminController.js';

const router = express.Router();

// Update the route to use 'addUser'
router.post('/add-user', addUser);
router.get('/users', getAllUsers);
router.put('/update-profile', updateProfile);

export default router;