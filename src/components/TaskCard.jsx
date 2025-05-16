import React from 'react';
import '../styles/components.css';

const TaskCard = ({ task, onToggleStatus }) => {
  return (
    <div className={`task-card ${task.status.toLowerCase()}`}>
      <h3>{task.title}</h3>
      <p>{task.description || 'No description'}</p>
      <button onClick={onToggleStatus}>
        Mark as {task.status === 'Pending' ? 'Completed' : 'Pending'}
      </button>
    </div>
  );
};

export default TaskCard;