import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('https://task-manager-app-c1l3.onrender.com/api/tasks');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskText) return;

    // Fix for the date bug:
    // When the user selects a date, browsers provide a string like 'YYYY-MM-DD'.
    // JavaScript's new Date() interprets this in the local timezone's offset,
    // which can lead to it being saved as the previous day in UTC.
    // To fix this, we will manually create a new date object that preserves
    // the selected date without any timezone shifting.
    let correctedDueDate = null;
    if (taskDueDate) {
      const [year, month, day] = taskDueDate.split('-');
      correctedDueDate = new Date(year, month - 1, day);
    }

    try {
      await fetch('https://task-manager-app-c1l3.onrender.com/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: taskText, dueDate: correctedDueDate }),
      });
      setTaskText('');
      setTaskDueDate('');
      fetchTasks(); // Refresh the list of tasks
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`https://task-manager-app-c1l3.onrender.com/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks(); // Refresh the list of tasks
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await fetch(`https://task-manager-app-c1l3.onrender.com/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      fetchTasks(); // Refresh the list of tasks
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getStatus = (dueDate, completed) => {
    if (completed) {
      return 'Done';
    }
    if (!dueDate) {
      return 'No due date';
    }

    const now = new Date();
    const due = new Date(dueDate);

    // Normalize dates to compare only the day
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (dueDay.getTime() === today.getTime()) {
      return 'Due Today';
    } else if (dueDay < today) {
      return 'Overdue';
    } else {
      return 'Upcoming';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Task Manager</h1>
      </header>
      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          type="text"
          placeholder="Enter Task description..."
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          className="task-input"
        />
        <input
          type="date"
          value={taskDueDate.split('T')[0]}
          onChange={(e) => setTaskDueDate(e.target.value)}
          className="date-input"
        />
        <button type="submit" className="add-button">Add Task</button>
      </form>
      <div className="task-list">
        {tasks.length > 0 ? (
          <div className="task-table-container">
            <div className="task-table-header">
              <div className="header-cell">Task</div>
              <div className="header-cell">Due Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>
            {tasks.map((task) => (
              <div key={task._id} className={`task-row ${task.completed ? 'completed' : ''}`}>
                <div className="task-cell task-text">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                    className="task-checkbox"
                  />
                  {/* The task name is displayed here next to the checkbox */}
                  <span>{task.text}</span>
                </div>
                <div className="task-cell due-date">{formatDate(task.dueDate)}</div>
                <div className={`task-cell status ${getStatus(task.dueDate, task.completed).toLowerCase().replace(' ', '-')}`}>
                  {getStatus(task.dueDate, task.completed)}
                </div>
                <div className="task-cell actions">
                  <button onClick={() => handleDeleteTask(task._id)} className="delete-button">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-tasks-message">No tasks to display.</p>
        )}
      </div>
    </div>
  );
}

export default App;