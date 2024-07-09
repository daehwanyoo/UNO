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

let rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substr(2, 5).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(player => player.playerId !== socket.id);
      if (rooms[roomCode].players.length === 0) {
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
      }
    }
  });

  socket.on('createGame', (data) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [{ playerId: socket.id, displayName: data.displayName, isReady: false }]
    };
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
  });

  socket.on('joinGame', (data) => {
    const { roomCode, displayName } = data;
    if (rooms[roomCode]) {
      rooms[roomCode].players.push({ playerId: socket.id, displayName, isReady: false });
      socket.join(roomCode);
      io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
    } else {
      socket.emit('error', 'Room does not exist');
    }
  });

  socket.on('readyUp', (roomCode) => {
    const room = rooms[roomCode];
    if (room) {
      const player = room.players.find(player => player.playerId === socket.id);
      if (player) {
        player.isReady = !player.isReady;
        io.to(roomCode).emit('updatePlayers', room.players);
        if (room.players.every(p => p.isReady)) {
          io.to(roomCode).emit('allReady');
        }
      }
    }
  });

  socket.on('editPlayerName', (data) => {
    const { roomCode, newName } = data;
    const room = rooms[roomCode];
    if (room) {
      const player = room.players.find(player => player.playerId === socket.id);
      if (player) {
        player.displayName = newName;
        io.to(roomCode).emit('updatePlayers', room.players);
      }
    }
  });

  socket.on('leaveGame', (roomCode) => {
    const room = rooms[roomCode];
    if (room) {
      room.players = room.players.filter(player => player.playerId !== socket.id);
      socket.leave(roomCode);
      if (room.players.length === 0) {
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit('updatePlayers', room.players);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
