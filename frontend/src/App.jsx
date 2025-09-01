import { useEffect, useState } from 'react';

const API_BASE_URL = 'https://task-manager-app-c1l3.onrender.com/api/tasks';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get a date at midnight in the local timezone
  const getLocalDate = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const getTaskStatus = (dueDate, completed) => {
    if (completed) {
      return 'Done';
    }
    if (!dueDate) {
      return 'No Due Date';
    }

    const today = getLocalDate(new Date());
    const taskDate = getLocalDate(dueDate);

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
        return 'bg-red-500 text-white';
      case 'Due Today':
        return 'bg-blue-500 text-white';
      case 'Upcoming':
        return 'bg-yellow-500 text-gray-800';
      case 'Done':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
      console.error('Task text is required.');
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 sm:p-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-800 mb-6">Task Manager</h1>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <input
            type="text"
            className="flex-grow w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Enter a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <input
            type="date"
            className="w-full sm:w-auto p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-800"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <button
            onClick={handleAddTask}
            className={`w-full sm:w-auto p-3 rounded-xl text-white font-bold transition duration-200 transform ${
              newTask.trim() === ''
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
            disabled={newTask.trim() === ''}
          >
            Add Task
          </button>
        </div>

        {isLoading && (
          <div className="text-center text-gray-500 py-8">Loading tasks...</div>
        )}

        {!isLoading && (
          <div className="bg-gray-50 rounded-xl overflow-hidden shadow-inner">
            <div className="p-4 bg-gray-200 rounded-t-xl grid grid-cols-4 gap-4 text-gray-600 font-bold uppercase text-sm border-b border-gray-300">
              <span>Task</span>
              <span>Due Date</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {tasks.length === 0 ? (
              <p className="p-4 text-center text-gray-500 italic">No tasks found. Start by adding one above!</p>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task._id}
                  className={`p-4 grid grid-cols-4 gap-4 items-center border-b border-gray-200 last:border-b-0 ${
                    task.completed ? 'bg-gray-100' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task._id, task.completed)}
                      className="form-checkbox h-5 w-5 text-green-500 rounded-full border-gray-300 cursor-pointer focus:ring-green-500"
                    />
                    <span className={`text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.text}
                    </span>
                  </div>
                  <span className="text-gray-600 text-sm">{formatDate(task.dueDate)}</span>
                  <div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(getTaskStatus(task.dueDate, task.completed))}`}>
                      {getTaskStatus(task.dueDate, task.completed).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
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