import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 
import taskRoutes from './routes/taskRoutes.js';

const app = express();

// --- UPDATED CORS SECTION ---
const allowedOrigins = [
<<<<<<< HEAD
  'https://worklog-system.vercel.app/', // This is your Vercel link from Render dashboard
=======
  process.env.FRONTEND_URL, // This is your Vercel link from Render dashboard
>>>>>>> 831c38a753118d58c7e27466b0acc432c7373ed9
  'http://localhost:5173',  // Keep this for local testing
];

app.use(cors({
  origin: (origin, callback) => {
    // If no origin (like Postman) or origin is in our list, allow it
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// ----------------------------

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));