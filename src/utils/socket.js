import { io } from "socket.io-client";

const token = localStorage.getItem("whiteboard_user_token");

const socket = io("https://api-whiteboard-az.onrender.com", {
  extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  maxReconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Socket reconnection error:', error);
});

export default socket;