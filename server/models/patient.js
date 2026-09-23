const mongoose = require('mongoose');

// Blueprint for every patient added to the system
const patientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Female' },
    status: { type: String, enum: ['Active', 'Pending', 'Archived'], default: 'Active' }
  },
  { timestamps: true } // Automatically records when the patient was created/updated
);

module.exports = mongoose.model('Patient', patientSchema);