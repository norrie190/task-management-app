import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PersonalTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', priority: '' });
  
useEffect(() => {
  const token = localStorage.getItem('token');
  
  axios.get('http://localhost:3001/api/personal-tasks', {
    headers: { Authorization: token }
  })
  .then((response) => setTasks(response.data))
  .catch((error) => console.error('Error fetching tasks:', error));
}, []);

const userId = localStorage.getItem('userId');
const handleAddTask = () => {
  const taskToAdd = {
    ...newTask,
    user_id: userId 
  };

  axios.post('/api/personal-tasks', taskToAdd, { withCredentials: true })
    .then((response) => {
      setTasks([...tasks, response.data]);
      setNewTask({ title: '', description: '', due_date: '', priority: '' });
    })
    .catch((error) => {
      console.error('Error adding task:', error);
    });
};


  return (
    <div className="personal-tasks">
      <h2>Personal Tasks</h2>
      
      <div className="new-task-form">
        <input
          type="text"
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="date"
          value={newTask.due_date}
          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
        />
        <select
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h4>{task.title} ({task.priority})</h4>
            <p>{task.description}</p>
            <p>Due Date: {task.due_date}</p>
            <button onClick={() => {}}>Mark as Completed</button>
            <button onClick={() => {}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonalTasks;
