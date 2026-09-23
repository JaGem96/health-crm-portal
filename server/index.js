const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.send('AfyaCRM API is running live.');
});

// Route Handlers
app.use('/api/patients', require('./patients'));
app.use('/api/tasks', require('./tasks'));

// Global 404 Fallback for JSON API
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on server.` });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is missing in environment variables!');
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
  });