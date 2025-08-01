// import { io } from 'socket.io-client';



// const socket = io(process.env.REACT_APP_API_URL, {
//   transports: ["websocket", "polling"],
//   secure: true,
//   withCredentials: true,
//   reconnection: true,
// });


// socket.on('connect_error', (err) => {
//   console.error("❌ WebSocket failed:", err.message);
// });

// export default socket;


import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ['polling', 'websocket'], // polling first
  withCredentials: true,
  reconnection: true,
  secure: true,
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ WebSocket failed:', err.message);
});

export default socket;