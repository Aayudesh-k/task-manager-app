import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to handle CORS policy
app.use(cors());
app.use(express.json());

// MongoDB connection string with the provided password
const MONGO_URI = 'mongodb+srv://a2kaparthi:mynewpassword123@social-media-app.2kuevih.mongodb.net/tasks_db?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Task Schema
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date, default: null }
});

const Task = mongoose.model('Task', taskSchema);

// API Endpoints
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Could not fetch tasks", error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { text, dueDate } = req.body;
    
    // Check if dueDate is a valid string before attempting to create a Date object
    const dateToSave = dueDate ? new Date(dueDate + 'T00:00:00Z') : null;
    
    const newTask = new Task({
      text,
      dueDate: dateToSave,
    });
    
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Error adding task", error: error.message });
  }
  
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});