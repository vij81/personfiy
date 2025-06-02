import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:8080/auth/login', formData);
      alert('Login successful!');
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <button type="submit">Login</button>
      </form>
      <a href="/register">Don't have an account? Register</a>
      <hr />
      <a href="http://localhost:8080/auth/google">
        <button type="button">Login with Google</button>
      </a>
    </div>
  );
};

export default Login;
