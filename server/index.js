const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/patients', require('./patients'));
app.use('/api/tasks', require('./tasks'));

// Root health check
app.get('/', (req, res) => {
  res.send('AfyaCRM Backend API is Live');
});

// JSON Fallback for unknown API routes (prevents HTML 404 JSON parsing errors on frontend)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB Connection Error:', err));