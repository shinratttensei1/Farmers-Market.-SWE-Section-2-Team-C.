import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://sersidw.pythonanywhere.com/',
  baseURL: 'http://127.0.0.1:5000/',
  headers: {
    'Content-Type': 'application/json', // Default Content-Type for all requests
  },
});

export default api;