import { io } from "socket.io-client";

const token = localStorage.getItem("whiteboard_user_token");

const socket = io("https://api-whiteboard-az.onrender.com", {
  extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  transports: ['websocket', 'polling'], // Ensure reliable connection
  timeout: 20000,
  forceNew: true // Force a new connection
});

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;