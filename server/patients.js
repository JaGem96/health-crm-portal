const express = require('express');
const router = express.Router();
const Patient = require('./models/patient');

// GET all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new patient
router.post('/', async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST add vitals to specific patient (:id/vitals)
router.post('/:id/vitals', async (req, res) => {
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

module.exports = router;