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
    methods: ['GET', 'POST'],
  },
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle incoming video stream
  socket.on('video-stream', (stream) => {
    // Broadcast the video stream with a unique ID to other clients
    socket.broadcast.emit('video-stream', { stream, id: socket.id });
  });

  // Handle offer (WebRTC signaling)
  socket.on('offer', (data) => {
    console.log('Offer received from:', socket.id);
    // Broadcast the offer with a unique ID to other clients
    socket.broadcast.emit('offer', { data, id: socket.id });
  });

  // Handle answer (WebRTC signaling)
  socket.on('answer', (data) => {
    console.log('Answer received from:', socket.id);
    // Broadcast the answer with a unique ID to other clients
    socket.broadcast.emit('answer', { data, id: socket.id });
  });

  // Handle ICE candidates (WebRTC signaling)
  socket.on('ice-candidate', (candidate) => {
    console.log('ICE Candidate received from:', socket.id);
    // Broadcast the ICE candidate with a unique ID to other clients
    socket.broadcast.emit('ice-candidate', { candidate, id: socket.id });
  });

  // Notify clients about user disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // Inform other clients about the disconnected user
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

// Dynamic port for deployment or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
