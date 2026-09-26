// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Patient = require('./models/patient');
const Task = require('./models/task');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// GET ALL PATIENTS
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE PATIENT
app.post('/api/patients', async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ADD TRIAGE VITALS TO PATIENT
app.post('/api/patients/:id/vitals', async (req, res) => {
  try {
    const { temperature, systolicBP, diastolicBP, pulseRate, weight } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    patient.vitals.push({ temperature, systolicBP, diastolicBP, pulseRate, weight });
    await patient.save();

    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET ALL TASKS
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedPatient').sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE TASK
app.post('/api/tasks', async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});