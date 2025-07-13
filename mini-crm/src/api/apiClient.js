import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'X-API-Key': process.env.REACT_APP_API_KEY,
    'ngrok-skip-browser-warning': 'true' 
  }
});

export default apiClient;