// Determine if we're in a local development environment
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_URL = isLocalDev 
  ? "http://localhost:5000"
  : "https://food-delivery-app-2-lcbi.onrender.com";