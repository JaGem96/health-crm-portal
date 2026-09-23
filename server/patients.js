const express = require('express');
const router = express.Router();

// Mock Database Storage (Structured identically to PostgreSQL tables)
let patients = [
  {
    id: 1,
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+254 712 345 678',
    gender: 'Female',
    status: 'Active',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+254 722 987 654',
    gender: 'Male',
    status: 'Pending',
    created_at: new Date().toISOString()
  }
];

// GET /api/patients - Fetch all patient records
router.get('/', (req, res) => {
  res.json({ success: true, count: patients.length, data: patients });
});

// POST /api/patients - Add a new patient record
router.post('/', (req, res) => {
  const { fullName, email, phone, gender, status } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required fields.' });
  }

  const newPatient = {
    id: patients.length + 1,
    fullName,
    email,
    phone: phone || 'N/A',
    gender: gender || 'Other',
    status: status || 'Active',
    created_at: new Date().toISOString()
  };

  patients.push(newPatient);
  res.status(201).json({ success: true, data: newPatient });
});

module.exports = router;