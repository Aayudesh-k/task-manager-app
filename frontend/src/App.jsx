import React, { useState, useEffect } from 'react';

const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // This effect runs once to initialize Firebase and handle user authentication
    if (typeof firebase === 'undefined') {
      setError("Firebase SDKs not loaded correctly. Please check your network connection.");
      return;
    }

    try {
      const firebaseApp = firebase.initializeApp(firebaseConfig);
      const firebaseAuth = firebaseApp.auth();
      const firestoreDb = firebaseApp.firestore();
      
      setAuth(firebaseAuth);
      setDb(firestoreDb);

      if (initialAuthToken) {
        firebaseAuth.signInWithCustomToken(initialAuthToken).catch(e => {
          console.error("Firebase Auth Error:", e);
          setError("Authentication failed. Please try again.");
        });
      } else {
        firebaseAuth.signInAnonymously().catch(e => {
          console.error("Firebase Auth Error:", e);
          setError("Authentication failed. Please try again.");
        });
      }
    } catch (e) {
      console.error("Firebase Initialization Error:", e);
      setError("Failed to initialize Firebase. Check your console for details.");
    }
  }, []);

  useEffect(() => {
    // This effect handles setting up the Firestore listener after authentication.
    if (!auth || !db) return;

    const unsubscribeAuth = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const unsubscribeFirestore = db.collection(`artifacts/${appId}/users/${firebaseUser.uid}/tasks`).onSnapshot((querySnapshot) => {
          const tasksArray = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTasks(tasksArray);
          setLoading(false);
        }, (e) => {
          console.error("Firestore fetch error:", e);
          setError("Failed to fetch tasks. Check your Firestore rules.");
          setLoading(false);
        });
        return () => unsubscribeFirestore();
      } else {
        setUser(null);
        setTasks([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim() || !user || !db) {
      setError('Task text cannot be empty and you must be authenticated.');
      return;
    }

    try {
      await db.collection(`artifacts/${appId}/users/${user.uid}/tasks`).add({
        text: newTaskText,
        dueDate: newTaskDueDate,
        completed: false,
        createdAt: new Date(),
      });
      setNewTaskText('');
      setNewTaskDueDate('');
    } catch (e) {
      console.error("Error adding task:", e);
      setError(`Error adding task: ${e.message}`);
    }
  };

  const toggleTaskCompletion = async (id, completed) => {
    if (!user || !db) {
      setError("Authentication required to update tasks.");
      return;
    }
    try {
      await db.collection(`artifacts/${appId}/users/${user.uid}/tasks`).doc(id).update({
        completed: !completed
      });
    } catch (e) {
      console.error("Error updating task:", e);
      setError(`Error updating task: ${e.message}`);
    }
  };

  const deleteTask = async (id) => {
    if (!user || !db) {
      setError("Authentication required to delete tasks.");
      return;
    }
    try {
      await db.collection(`artifacts/${appId}/users/${user.uid}/tasks`).doc(id).delete();
    } catch (e) {
      console.error("Error deleting task:", e);
      setError(`Error deleting task: ${e.message}`);
    }
  };

  const getTaskStatus = (task) => {
    if (task.completed) return 'Done';
    if (!task.dueDate) return 'No Due Date';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      return 'Overdue';
    } else if (dueDate.getTime() === today.getTime()) {
      return 'Due Today';
    } else {
      return 'Upcoming';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Task Manager
        </h1>

        {user && (
          <div className="text-center text-gray-600 mb-4">
            Logged in as: <span className="font-mono text-sm">{user.uid}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Enter a new task"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Add Task
          </button>
        </form>

        {loading ? (
          <div className="text-center text-gray-500">Loading tasks...</div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center text-gray-500 font-medium pb-2 border-b-2 border-gray-200">
              <div>Task</div>
              <div>Due Date</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 mt-4">No tasks found. Add a new one!</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4 py-3 border-b border-gray-200 last:border-b-0">
                  <div className={`text-gray-800 text-center ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.text}
                  </div>
                  <div className="text-gray-600 text-center">
                    {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                  </div>
                  <div className="text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      getTaskStatus(task) === 'Done' ? 'bg-green-100 text-green-700' :
                      getTaskStatus(task) === 'Overdue' ? 'bg-red-100 text-red-700' :
                      getTaskStatus(task) === 'Due Today' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {getTaskStatus(task).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.completed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500">
                          <polyline points="9 11 12 14 22 4"></polyline>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                      aria-label="Delete task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js"></script>
      <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-auth.js"></script>
      <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-firestore.js"></script>
    </div>
  );
};

export default App;