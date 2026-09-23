const mongoose = require('mongoose');

// Blueprint for every task in the workflow queue
const taskSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    priority: { 
      type: String, 
      enum: ['Low', 'Medium', 'High'], 
      default: 'Medium' 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'In Progress', 'Completed'], 
      default: 'Pending' 
    },
    // Relational reference linking a task to a specific patient ID
    assignedPatient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Patient', 
      default: null 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);