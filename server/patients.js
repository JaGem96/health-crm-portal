const express = require('express');
const router = express.Router();
const Patient = require('./models/patient');

// GET all patients (or filtered by search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create patient
router.post('/', async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    await newPatient.save();
    res.json({ success: true, data: newPatient });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add vitals
router.post('/:id/vitals', async (req, res) => {
  try {
    const { temperature, systolicBP, diastolicBP, pulseRate, weight, loggedBy } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    patient.vitals.push({
      temperature: Number(temperature),
      systolicBP: Number(systolicBP),
      diastolicBP: Number(diastolicBP),
      pulseRate: Number(pulseRate),
      weight: Number(weight),
      loggedBy: loggedBy || 'Nurse'
    });

    await patient.save();
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;