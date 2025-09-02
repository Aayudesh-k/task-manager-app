const router = require('express').Router();
const Task = require('../models/task');

// Get all tasks, sorted by due date
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const newTask = new Task({
      text: req.body.text,
      dueDate: req.body.dueDate,
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json('Task has been deleted...');
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;