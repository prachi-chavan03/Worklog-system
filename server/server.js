import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Shortcut to load .env immediately
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // Ensure this file exists!

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));