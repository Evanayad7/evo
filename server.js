// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import CORS for cross-origin requests

// Initialize Express app
const app = express();

// Middleware for CORS
app.use(cors());

// Serve static files (e.g., client-side HTML, JS)
app.use(express.static('public'));

// Create HTTP server and pass the app to it
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins (update this with specific domains in production)
    methods: ['GET', 'POST']
  }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming video stream
  socket.on('video-stream', (stream) => {
    // Broadcast the video stream to other connected clients
    socket.broadcast.emit('video-stream', stream);
  });

  // Handle offer (WebRTC signaling)
  socket.on('offer', (data) => {
    console.log('Offer received:', data);
    // Broadcast the offer to other clients
    socket.broadcast.emit('offer', data);
  });

  // Handle answer (WebRTC signaling)
  socket.on('answer', (data) => {
    console.log('Answer received:', data);
    // Broadcast the answer to other clients
    socket.broadcast.emit('answer', data);
  });

  // Handle ICE candidates (WebRTC signaling)
  socket.on('ice-candidate', (candidate) => {
    console.log('ICE Candidate received:', candidate);
    // Broadcast the ICE candidate to other clients
    socket.broadcast.emit('ice-candidate', candidate);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Dynamic port for deployment or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
