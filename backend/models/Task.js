const mongoose = require('mongoose');

// Define the schema for a Task
const TaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Task model
const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
