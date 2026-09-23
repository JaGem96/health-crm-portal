require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
a// Check lines 17-19 in server/index.js
app.use('/api/patients', require('./patients'));
app.use('/api/tasks', require('./tasks'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));