const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set up a basic route for testing
app.get("/", (req, res) => {
  res.send("WebRTC signaling server is running.");
});

// Store connected users and rooms
const users = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle 'offer' event
  socket.on("offer", (data) => {
    const { sdp, type } = data;
    console.log(`Received offer from ${socket.id}`);
    // Broadcast the offer to all other users
    socket.broadcast.emit("offer", { sdp, type });
  });

  // Handle 'answer' event
  socket.on("answer", (data) => {
    const { sdp, type } = data;
    console.log(`Received answer from ${socket.id}`);
    // Broadcast the answer to all other users
    socket.broadcast.emit("answer", { sdp, type });
  });

  // Handle 'ice-candidate' event
  socket.on("ice-candidate", (data) => {
    const { candidate, sdpMid, sdpMLineIndex } = data;
    console.log(`Received ICE candidate from ${socket.id}`);
    // Broadcast the ICE candidate to all other users
    socket.broadcast.emit("ice-candidate", { candidate, sdpMid, sdpMLineIndex });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    users.delete(socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server is running on port ${PORT}`);
});
