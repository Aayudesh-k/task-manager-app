import { useEffect, useState } from 'react';

const API_BASE_URL = 'https://task-manager-app-c1l3.onrender.com/api/tasks';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const isOverdue = (dateString, completed) => {
    if (completed || !dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    return new Date(dateString) < today;
  };

  const categorizeTasks = (allTasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const categories = {
      overdue: [],
      dueToday: [],
      upcoming: [],
      done: [],
    };

    allTasks.forEach(task => {
      if (task.completed) {
        categories.done.push(task);
      } else if (isOverdue(task.dueDate, task.completed)) {
        categories.overdue.push(task);
      } else if (new Date(task.dueDate).toDateString() === today.toDateString()) {
        categories.dueToday.push(task);
      } else {
        categories.upcoming.push(task);
      }
    });

    return categories;
  };

  const categorizedTasks = categorizeTasks(tasks);

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
      } finally {
        setIsLoading(false);
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
        body: JSON.stringify({ text: newTask, dueDate: newDueDate }),
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
  
  const renderTaskSection = (title, taskList, colorClass) => (
    <div className="space-y-4">
      <h2 className={`text-xl font-bold border-b-2 pb-2 ${colorClass}`}>{title}</h2>
      <ul className="space-y-2">
        {taskList.length === 0 ? (
          <p className="text-gray-400">No tasks in this category.</p>
        ) : (
          taskList.map((task) => (
            <li key={task._id} className="bg-gray-700 p-4 rounded-lg shadow-md flex items-center justify-between transition-all duration-200">
              <div 
                className="flex items-center flex-grow cursor-pointer"
                onClick={() => handleToggleTask(task._id, task.completed)}
              >
                <span className={`text-2xl mr-3`}>
                  {task.completed ? '✅' : '⬜'}
                </span>
                <div className="flex flex-col">
                  <span className={`text-lg transition-colors duration-200 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                    {task.text}
                  </span>
                  <span className={`text-sm mt-1 font-semibold ${isOverdue(task.dueDate, task.completed) ? 'text-red-400' : 'text-gray-400'}`}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>
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
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg mt-10">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-100">Task Manager</h1>
        
        {/* Input and Add Button */}
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
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center text-gray-400">Loading tasks...</div>
        )}

        {/* Task Categories */}
        {!isLoading && (
          <div className="space-y-8">
            {renderTaskSection('Overdue', categorizedTasks.overdue, 'text-red-500')}
            {renderTaskSection('Due Today', categorizedTasks.dueToday, 'text-blue-500')}
            {renderTaskSection('Upcoming', categorizedTasks.upcoming, 'text-yellow-500')}
            {renderTaskSection('Done', categorizedTasks.done, 'text-green-500')}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;