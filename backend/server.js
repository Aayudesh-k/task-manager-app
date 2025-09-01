const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const tasksRoute = require('./routes/tasks');

// Configure CORS to allow requests from any origin. This is ideal for development.
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/tasks', tasksRoute);

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Task Manager API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));