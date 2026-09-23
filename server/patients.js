const express = require('express');
const router = express.Router();
const Patient = require('./models/patient');


// Add Vitals entry to a patient
router.post('/:id/vitals', async (req, res) => {
  try {
    const { temperature, systolicBP, diastolicBP, pulseRate, weight, loggedBy } = req.body;
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

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

// Update SHA / NHIF Insurance Claim Status
router.patch('/:id/insurance', async (req, res) => {
  try {
    const { insuranceProvider, shaNumber, claimStatus, preAuthCode } = req.body;
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { insuranceProvider, shaNumber, claimStatus, preAuthCode },
      { new: true }
    );
    res.json({ success: true, data: updatedPatient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;