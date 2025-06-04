import React, { useState } from 'react';
import axios from 'axios';
import './register.css';
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post('https://personfiy.onrender.com/auth/register', formData);
      alert('Registration successful!');
      localStorage.setItem('token', data.token);
      window.location.href = 'https://personfiy.netlify.app/dashboard';
    } catch (err) {
      alert(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <button type="submit">Register</button>
      </form>
      <a href="https://personfiy.netlify.app/">Already have an account? Login</a>
    </div>
  );
};

export default Register;

