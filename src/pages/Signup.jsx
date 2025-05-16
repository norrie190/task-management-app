import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css'; 

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h1 className="login-title">Sign Up for TaskFlow</h1>
        <form onSubmit={handleSignup} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">
            Sign Up
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <p className="signup-prompt">
          Already have an account?{' '}
          <button className="signup-button" onClick={() => navigate('/login')}>
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
