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
    console.log('A user connected:', socket.id);

    // Broadcast the user's connection to others
    socket.broadcast.emit('user-connected', socket.id);

    // Handle offer (WebRTC signaling)
    socket.on('offer', (data) => {
        console.log('Offer received from:', socket.id);
        // Send the offer to a specific user
        io.to(data.target).emit('offer', { data: data.sdp, id: socket.id });
    });

    // Handle answer (WebRTC signaling)
    socket.on('answer', (data) => {
        console.log('Answer received from:', socket.id);
        // Send the answer back to the offer sender
        io.to(data.target).emit('answer', { data: data.sdp, id: socket.id });
    });

    // Handle ICE candidates (WebRTC signaling)
    socket.on('ice-candidate', (data) => {
        console.log('ICE Candidate received from:', socket.id);
        // Send the ICE candidate to the appropriate peer
        io.to(data.target).emit('ice-candidate', { candidate: data.candidate, id: socket.id });
    });

    // Notify other clients about user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Notify remaining clients about the disconnection
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

// Dynamic port for deployment or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
