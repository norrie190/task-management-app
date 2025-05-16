import React, { useState } from 'react';
import TaskCard from '../components/TaskCard';
import '../styles/main.css';

const TaskList = () => {
  // demo tasks
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete assignment', status: 'Pending' },
    { id: 2, title: 'Prepare presentation', status: 'Completed' },
  ]);

  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: task.status === 'Pending' ? 'Completed' : 'Pending' } : task
    ));
  };

  return (
    <div className="task-list-container">
      <h2>Task List</h2>
      <div className="tasks">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleStatus={() => toggleTaskStatus(task.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;