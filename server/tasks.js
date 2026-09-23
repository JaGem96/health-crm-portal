const express = require('express');
const router = express.Router();

let tasks = [
  { id: 1, title: 'Follow up on lab results for Jane Doe', priority: 'High', status: 'Pending' },
  { id: 2, title: 'Verify medical insurance for John Smith', priority: 'Medium', status: 'Completed' }
];

// GET /api/tasks
router.get('/', (req, res) => {
  res.json({ success: true, count: tasks.length, data: tasks });
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { title, priority } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Task title is required.' });

  const newTask = {
    id: tasks.length + 1,
    title,
    priority: priority || 'Medium',
    status: 'Pending'
  };

  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

module.exports = router;