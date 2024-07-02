// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(cors());

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Example of handling a custom event
    socket.on('example-event', (data) => {
        console.log('Received example-event with data:', data);
        // Broadcast the event to all connected clients
        io.emit('example-event-response', { response: 'Response data from server' });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
