import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5000',
// });
// Use environment variable in React
const API = axios.create({
  baseURL: 'https://personfiy.onrender.com',
  withCredentials: true,
});


export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
