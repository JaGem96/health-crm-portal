const express = require('express');
const cors = require('cors');
require('dotenv').config();

const patientsRouter = require('./patients');
const tasksRouter = require('./tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/patients', patientsRouter);
app.use('/api/tasks', tasksRouter);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CRM Backend Server Running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});