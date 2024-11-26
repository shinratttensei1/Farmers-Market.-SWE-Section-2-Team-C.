import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://sersidw.pythonanywhere.com/',
  headers: {
    'Content-Type': 'application/json', // Default Content-Type for all requests
  },
});

export default api;