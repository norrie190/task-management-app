import React, { useState } from 'react';
import '../styles/main.css';

const TeamAdmin = () => {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'John Doe', tasksAssigned: 3 },
    { id: 2, name: 'Jane Smith', tasksAssigned: 5 },
  ]);

  const assignTask = (memberId) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, tasksAssigned: member.tasksAssigned + 1 } 
        : member
    ));
  };

  return (
    <div className="team-admin-container">
      <h2>Team Management</h2>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Tasks Assigned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.tasksAssigned}</td>
              <td>
                <button onClick={() => assignTask(member.id)}>
                  Assign Task
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamAdmin;