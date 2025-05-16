import React, { useState, useEffect } from 'react';
import { FiClipboard, FiUsers, FiTrash2, FiPlus } from 'react-icons/fi';
import '../styles/admin.css';

const Admin = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskId, setTaskId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [assignMessage, setAssignMessage] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    list_id: null,
    assigned_user: null
  });

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/users?role=admin')
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => {
        console.error(err);
        setUsers([]);
      });

    fetch('http://localhost:3001/api/all-tasks?role=admin')
      .then(res => res.json())
      .then(data => setTasks(data.tasks || []))
      .catch(err => {
        console.error(err);
        setTasks([]);
      });
  }, []);

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const assignTask = async () => {
    if (!taskId || selectedUserIds.length === 0) {
      setAssignMessage('Please select a task and at least one user.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/assign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, user_ids: selectedUserIds }),
      });

      const result = await response.json();
      setAssignMessage(result.message || 'Task assigned.');
      refreshTasks();
      setTaskId('');
      setSelectedUserIds([]);
    } catch (err) {
      console.error(err);
      setAssignMessage('Failed to assign task.');
    }
  };

  const refreshTasks = async () => {
    const res = await fetch('http://localhost:3001/api/all-tasks?role=admin');
    const data = await res.json();
    setTasks(data.tasks || []);
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success) {
        setTasks(prev => prev.filter(task => task.id !== id));
      } else {
        alert('Failed to delete task.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting task.');
    }
  };

  const toggleTaskCompletion = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${id}/toggle-complete`, {
        method: 'PATCH',
      });

      const result = await res.json();
      if (result.success) {
        setTasks(prev =>
          prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
          )
        );
      } else {
        alert('Failed to update task status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating task status.');
    }
  };

  const handleTaskCreate = async () => {
    if (!newTask.title) return alert('Task title required.');

    try {
      const res = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      const data = await res.json();
      if (data.success) {
        refreshTasks();
        setNewTask({ title: '', description: '', due_date: '', priority: 'Medium', list_id: null, assigned_user: null });
      } else {
        alert('Failed to create task.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating task.');
    }
  };

  const handleUserCreate = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('All fields are required to create user.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (data.userId) {
        alert('User created!');
        setNewUser({ username: '', email: '', password: '' });
        const usersRes = await fetch('http://localhost:3001/api/users?role=admin');
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      } else {
        alert(data.error || 'Failed to create user.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating user.');
    }
  };

  return (
    <div className="admin-glass">
      <div className="admin-header-glass">
        <h1><FiUsers /> Admin Dashboard</h1>
      </div>

      <div className="admin-tabs-3d">
        <h2><FiPlus /> Create Task</h2>
        <div className="admin-create-form">
          <input
            type="text"
            placeholder="Title"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="date"
            value={newTask.due_date}
            onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
          />
          <select
            value={newTask.priority}
            onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button className="primary-btn" onClick={handleTaskCreate}>Create Task</button>
        </div>

        <h2><FiPlus /> Create User</h2>
        <div className="admin-create-form">
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
          />
          <button className="primary-btn" onClick={handleUserCreate}>Create User</button>
        </div>

        <h2><FiClipboard /> Assign Tasks</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <select value={taskId} onChange={e => setTaskId(e.target.value)}>
            <option value="">Select Task</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>

          <div className="admin-user-select-box">
            {users.map(user => (
              <label key={user.id}>
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                />
                {' '}{user.username} ({user.email})
              </label>
            ))}
          </div>

          <button onClick={assignTask} className="primary-btn">Assign</button>
        </div>

        {assignMessage && <p>{assignMessage}</p>}

        <table className="admin-task-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assigned User</th>
              <th>List</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.assigned_user || 'Unassigned'}</td>
                <td>{task.list_name || '-'}</td>
                <td>{task.due_date || '—'}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    title="Toggle complete"
                  />
                </td>
                <td>
                  <button onClick={() => deleteTask(task.id)} className="delete-btn" title="Delete Task">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default Admin;
