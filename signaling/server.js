const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        socket.to(roomId).emit('user-connected', socket.id);
    });

    socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', data.sdp);
    });

    socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', data.sdp);
    });

    socket.on('candidate', (data) => {
        socket.to(data.roomId).emit('candidate', data.candidate);
    });

    socket.on('chat-message', (data) => {
        socket.to(data.roomId).emit('chat-message', data);
    });

    socket.on('hardware-info', (data) => {
        // Broadcast backend hardware specs to the room (so frontend can see what the Python backend is running on)
        socket.to(data.roomId).emit('hardware-info', data);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Signaling Server running on http://localhost:${PORT}`);
});
