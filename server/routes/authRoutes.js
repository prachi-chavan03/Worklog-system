import express from 'express';
const router = express.Router();
import { login } from '../controllers/authController.js';

// Test route to see if the router is even working
router.get('/test', (req, res) => res.send("Auth Route is Working"));

router.post('/login', login);

export default router;