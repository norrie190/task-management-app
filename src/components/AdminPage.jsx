import React, { useEffect, useState } from 'react';
import '../styles/admin.css';


const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [taskLists, setTaskLists] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      });

    fetch('http://localhost:3001/api/task-lists')
      .then(res => res.json())
      .then(data => {
        if (data.taskLists) setTaskLists(data.taskLists);
      });

    fetch('http://localhost:3001/api/all-tasks')
      .then(res => res.json())
      .then(data => {
        if (data.tasks) setTasks(data.tasks);
      });
  }, []);

  return (
    <div className="admin-glass">
      <header className="admin-header-glass">
        <h1>Admin Dashboard</h1>
      </header>

      <div className="admin-tabs-3d">
        <button className="active-tab">Users</button>
        <button>Task Lists</button>
        <button>Tasks</button>
      </div>

      <main className="admin-main-container">
        <section>
          <h2>Users</h2>
          <div className="employee-cards-container">
            {users.map(user => (
              <div className="employee-card-3d" key={user.id}>
                <div
                  className="avatar-glow"
                  style={{ backgroundColor: '#3498db' }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div className="employee-info">
                  <h3>{user.username}</h3>
                  <p className="employee-role">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Task Lists</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Owner ID</th>
                <th>Is Group</th>
              </tr>
            </thead>
            <tbody>
              {taskLists.map(list => (
                <tr key={list.id}>
                  <td>{list.id}</td>
                  <td>{list.name}</td>
                  <td>{list.owner_id}</td>
                  <td>{list.is_group ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Tasks</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Completed</th>
                <th>List</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{task.completed ? '✅' : '❌'}</td>
                  <td>{task.list_name || 'N/A'}</td>
                  <td>{task.assigned_user || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
