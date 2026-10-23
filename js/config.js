// Configuration for backend API endpoint
const API_BASE = window.location.origin && window.location.origin.startsWith("http") 
    ? "" 
    : "http://localhost:8080";

window.API_BASE = API_BASE;
