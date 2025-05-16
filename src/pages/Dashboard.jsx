import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Low',
  });

  
  useEffect(() => {
    axios.get('/api/my-tasks') 
      .then(res => setTasks(res.data))
      .catch(console.error);
  }, []);

  const handleDelete = (id) => {
    axios.delete(`/api/my-tasks/${id}`)
      .then(() => setTasks(prev => prev.filter(task => task.id !== id)))
      .catch(console.error);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    axios.post('/api/my-tasks', newTask)
      .then(res => {
        setTasks(prev => [...prev, res.data]);
        setNewTask({ title: '', description: '', due_date: '', priority: 'Low' });
      })
      .catch(console.error);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">My Dashboard</h1>

      {/* Task creation form */}
      <form className="dashboard-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Title"
          required
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          required
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="date"
          required
          value={newTask.due_date}
          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
        />
        <select
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      {/* Task list */}
      {tasks.length === 0 ? (
        <p>No personal tasks yet.</p>
      ) : (
        <div className="task-grid">
          {tasks.map(task => (
            <div className="task-card" key={task.id}>
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">{task.description}</p>
              <p className="task-due">Due: {task.due_date}</p>
              <p className={`task-priority priority-${task.priority.toLowerCase()}`}>
                {task.priority}
              </p>
              <button className="delete-task-btn" onClick={() => handleDelete(task.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
