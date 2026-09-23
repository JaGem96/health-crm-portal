const express = require('express');
const router = express.Router();
const Task = require('./models/task');

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedPatient').sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, priority, assignedPatient } = req.body;
    const taskData = { title, priority };
    if (assignedPatient) taskData.assignedPatient = assignedPatient;

    const newTask = new Task(taskData);
    await newTask.save();
    res.json({ success: true, data: newTask });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;