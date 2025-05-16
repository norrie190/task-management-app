import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/login.css';


axios.defaults.baseURL = 'http://localhost:3001';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    axios.post('/api/login', { email, password })
      .then(res => {
        const { token, user } = res.data;

        if (token && user) {
          login(user, token);
          navigate('/dashboard');
        } else {
          alert("Unexpected login response. Please try again.");
        }
      })
      .catch(err => {
        if (err.response?.status === 401) {
          alert("Invalid email or password.");
        } else if (err.response?.status === 400) {
          alert("Missing fields. Please fill out both email and password.");
        } else {
          console.error('Unexpected error:', err);
          alert("Login failed. Try again later.");
        }
      });
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h1 className="login-title">TaskFlow</h1>
        <form onSubmit={handleSubmit} className="login-form">
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
          <button type="submit" className="login-button">Log In</button>
        </form>
        <p className="signup-prompt">
          Don't have an account?{' '}
          <button 
            className="signup-button" 
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </p>
      </div>

      <div className="logo-below-container">
        <img 
          src="/images/TMS.logo2.jpg" 
          alt="Task Management System Logo" 
          className="logo-below"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    </div>
  );
};

export default Login;
