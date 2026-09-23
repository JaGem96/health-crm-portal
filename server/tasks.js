const express = require('express');
const router = express.Router();
const Task = require('./models/task');

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedPatient', 'fullName email').sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const task = await Task.create(req.body);
    const populatedTask = await Task.findById(task._id).populate('assignedPatient', 'fullName email');
    res.status(201).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/tasks/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('assignedPatient', 'fullName email');
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;