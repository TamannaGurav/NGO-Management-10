import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: { 
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  },
  params: {
    _: new Date().getTime() // Cache-busting parameter
  }
});

// Request interceptor for token injection
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add cache-buster to all GET requests
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _: new Date().getTime()
    };
  }
  
  return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

// Enhanced auth token handler
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete API.defaults.headers.common["Authorization"];
  }
};

// Fetch events with caching disabled
export const fetchEvents = () => API.get('/events');

// Fetch tasks
export const fetchTasks = () => API.get('/tasks');

export default API;