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
    completed: false,
  });

  useEffect(() => {
    axios
      .get('/api/personal-tasks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(res => setTasks(res.data))
      .catch(err => console.error('Error fetching tasks:', err));
  }, []);

  const handleDelete = (id) => {
    axios
      .delete(`/api/personal-tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(() => setTasks(prev => prev.filter(task => task.id !== id)))
      .catch(err => console.error('Error deleting task:', err));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    axios
      .post('/api/personal-tasks', newTask, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(res => {
        setTasks(prev => [...prev, res.data]);
        setNewTask({ title: '', description: '', due_date: '', priority: 'Low', completed: false });
      })
      .catch(err => console.error('Error creating task:', err));
  };

  const toggleComplete = (task) => {
    const updatedTask = {
      ...task,
      completed: task.completed ? 0 : 1,
    };

    axios
      .put(`/api/personal-tasks/${task.id}`, updatedTask, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(() => {
        setTasks(prev =>
          prev.map(t => (t.id === task.id ? { ...t, completed: updatedTask.completed } : t))
        );
      })
      .catch(err => console.error('Error toggling completion:', err));
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">My Tasks</h1>

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

      {tasks.length === 0 ? (
        <p>No personal tasks yet.</p>
      ) : (
        <table className="task-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{new Date(task.due_date).toLocaleDateString()}</td>
                <td className={`priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </td>
                <td className={task.completed ? 'completed' : 'incomplete'}>
                  {task.completed ? '✅ Completed' : '❌ Incomplete'}
                </td>
                <td>
                  <button onClick={() => toggleComplete(task)}>
                    {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button className="delete-task-btn" onClick={() => handleDelete(task.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
