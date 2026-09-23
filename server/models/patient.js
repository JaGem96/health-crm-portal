const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
  temperature: { type: Number },
  systolicBP: { type: Number },
  diastolicBP: { type: Number },
  pulseRate: { type: Number },
  weight: { type: Number },
  loggedBy: { type: String, default: 'Nurse' },
  loggedAt: { type: Date, default: Date.now }
});

const PatientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  gender: { type: String, default: 'Female' },
  insuranceProvider: { type: String, default: 'SHA/NHIF' },
  shaNumber: { type: String },
  claimStatus: { type: String, default: 'Pending' },
  preAuthCode: { type: String },
  vitals: [VitalsSchema]
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);