const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
  loggedAt: { type: Date, default: Date.now },
  temperature: { type: Number }, // °C
  systolicBP: { type: Number },  // mmHg
  diastolicBP: { type: Number }, // mmHg
  pulseRate: { type: Number },   // bpm
  weight: { type: Number },      // kg
  loggedBy: { type: String, default: 'Nurse' }
});

const PatientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Female' },
  
  // SHA / NHIF Insurance Tracking
  insuranceProvider: { type: String, enum: ['SHA/NHIF', 'Private', 'Cash'], default: 'Cash' },
  shaNumber: { type: String, default: '' },
  claimStatus: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
  preAuthCode: { type: String, default: '' },

  // Vitals Array
  vitals: [VitalsSchema]
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);