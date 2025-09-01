import { useEffect, useState } from 'react';

const API_BASE_URL = 'https://task-manager-app-c1l3.onrender.com/api/tasks';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // Fetch all tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasksData = await response.json();
        setTasks(tasksData);
      } catch (error) {
        console.error("Could not fetch tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Add a new task
  const handleAddTask = async () => {
    if (newTask.trim() === '') {
      alert('Please enter a task.');
      return;
    }
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTask }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const addedTask = await response.json();
      setTasks([...tasks, addedTask]);
      setNewTask('');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Toggle a task's completion status
  const handleToggleTask = async (id, completed) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const isInputEmpty = newTask.trim() === '';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-100">Task Manager</h1>
        
        {/* Input and Add Button */}
        <div className="flex items-center space-x-4 mb-6">
          <input
            type="text"
            className="flex-grow p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
            placeholder="Enter a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
            }}
          />
          <button
            onClick={handleAddTask}
            className={`p-3 rounded-lg font-bold text-white transition-all duration-300 transform ${isInputEmpty ? 'bg-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'}`}
            disabled={isInputEmpty}
          >
            Add Task
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-400">No tasks yet! Add one above.</p>
          ) : (
            tasks.map((task) => (
              <li key={task._id} className="bg-gray-700 p-4 rounded-lg shadow-md flex items-center justify-between transition-all duration-200 transform hover:scale-105">
                <div 
                  className="flex items-center flex-grow cursor-pointer"
                  onClick={() => handleToggleTask(task._id, task.completed)}
                >
                  {task.completed ? (
                    <span className="text-emerald-500 text-2xl mr-3 transition-colors duration-200">✅</span>
                  ) : (
                    <span className="text-gray-400 text-2xl mr-3 transition-colors duration-200">⬜</span>
                  )}
                  <span className={`text-lg transition-colors duration-200 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-2 rounded-full text-gray-400 hover:text-red-500 transition-all duration-200"
                >
                  <span className="text-xl">🗑️</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default App;