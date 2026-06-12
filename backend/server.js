require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { connectDB } = require('./config/db');

const authRoutes   = require('./routes/auth');
const userRoutes   = require('./routes/users');
const skillRoutes  = require('./routes/skills');
const quizRoutes   = require('./routes/quizzes');
const resultRoutes = require('./routes/results');

const app = express();

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/skills',  skillRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler — services throw errors with optional statusCode
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
