import axios from "axios";

console.log("Base URL:", process.env.REACT_APP_API_BASE_URL);

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
console.log("Base URL:", process.env.REACT_APP_API_BASE_URL);

// Add a function to set the authorization token
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// Fetch tasks
export const fetchTasks = () => {
    return API.get('/tasks');
  };

export default API;
