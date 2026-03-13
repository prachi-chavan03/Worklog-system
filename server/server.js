import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 
import taskRoutes from './routes/taskRoutes.js';

const app = express();
// --- UPDATED CORS SECTION ---
app.use(cors());
// ----------------------------
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));