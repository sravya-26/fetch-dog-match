import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://frontend-take-home-service.fetch.com/auth/login', {
        name,
        email
      }, { withCredentials: true });
  
      onLogin();
      navigate('/search', { state: { userName: name } });
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };  

  return (
    <div className="login-page">
      <div className="marquee">
        <div className="scrolling-text">
          🐾 Adopt. Match. Love. | Built by Sravya Koyi | Powered by Fetch | Find your furry soulmate today! 🐾
        </div>
      </div>

      <div className="login-layout">
        <div className="login-image" />
        <div className="login-form-wrapper">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>🦴 FetchAFriend</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">🔐 Login</button>
          </form>
        </div>
      </div>
    </div>

  );
}

export default Login;