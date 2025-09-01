import { useEffect, useState } from 'react';

const API_BASE_URL = 'https://task-manager-app-c1l3.onrender.com/api/tasks';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const getTaskStatus = (dueDate, completed) => {
    if (completed) {
      return 'Done';
    }
    if (!dueDate) {
      return 'No Due Date';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate < today) {
      return 'Overdue';
    } else if (taskDate.getTime() === today.getTime()) {
      return 'Due Today';
    } else {
      return 'Upcoming';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Overdue':
        return 'bg-red-500';
      case 'Due Today':
        return 'bg-blue-500';
      case 'Upcoming':
        return 'bg-yellow-500';
      case 'Done':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1); // Add a day to correct for timezone offset
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
  };

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
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

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
        body: JSON.stringify({ text: newTask, dueDate: newDueDate || null }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const addedTask = await response.json();
      setTasks([...tasks, addedTask]);
      setNewTask('');
      setNewDueDate('');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl mt-10">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-100">Task Manager</h1>
        
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <input
            type="text"
            className="flex-grow p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 w-full"
            placeholder="Enter a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
            }}
          />
          <input
            type="date"
            className="p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <button
            onClick={handleAddTask}
            className={`p-3 rounded-lg font-bold text-white transition-all duration-300 transform w-full md:w-auto ${newTask.trim() === '' ? 'bg-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'}`}
            disabled={newTask.trim() === ''}
          >
            Add Task
          </button>
        </div>
        
        {isLoading && (
          <div className="text-center text-gray-400">Loading tasks...</div>
        )}

        {!isLoading && (
          <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 grid grid-cols-4 gap-4 text-gray-400 font-bold uppercase border-b-2 border-gray-600">
              <span>Task</span>
              <span>Due Date</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {tasks.length === 0 ? (
              <p className="p-4 text-center text-gray-400">No tasks found.</p>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task._id} 
                  className="p-4 grid grid-cols-4 gap-4 items-center border-b border-gray-600 last:border-b-0"
                >
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => handleToggleTask(task._id, task.completed)}
                      className="form-checkbox h-5 w-5 text-emerald-600 bg-gray-700 border-gray-600 rounded cursor-pointer"
                    />
                    <span className={`ml-3 transition-colors duration-200 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                      {task.text}
                    </span>
                  </div>
                  <span className="text-gray-300">{formatDate(task.dueDate)}</span>
                  <div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(getTaskStatus(task.dueDate, task.completed))}`}>
                      {getTaskStatus(task.dueDate, task.completed).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-2 rounded-full text-gray-400 hover:text-red-500 transition-all duration-200 self-center justify-self-center"
                  >
                    <span className="text-xl">🗑️</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;