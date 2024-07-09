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

let lobby = {
  players: []
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    lobby.players = lobby.players.filter(player => player.playerId !== socket.id);
    io.emit('updatePlayers', lobby.players);
    console.log(`Updated lobby after disconnect: ${JSON.stringify(lobby)}`);
  });

  socket.on('joinLobby', (data) => {
    console.log(`Received joinLobby event with data: ${JSON.stringify(data)}`);
    lobby.players.push({ playerId: socket.id, displayName: data.displayName, isReady: false });
    socket.join('lobby');
    io.emit('updatePlayers', lobby.players);
    console.log(`Lobby state after join: ${JSON.stringify(lobby)}`);
  });

  socket.on('readyUp', () => {
    const player = lobby.players.find(player => player.playerId === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      io.emit('updatePlayers', lobby.players);
      if (lobby.players.every(p => p.isReady)) {
        io.emit('allReady');
      }
      console.log(`Lobby state after readyUp: ${JSON.stringify(lobby)}`);
    }
  });

  socket.on('editPlayerName', (newName) => {
    const player = lobby.players.find(player => player.playerId === socket.id);
    if (player) {
      player.displayName = newName;
      io.emit('updatePlayers', lobby.players);
      console.log(`Lobby state after editPlayerName: ${JSON.stringify(lobby)}`);
    }
  });

  socket.on('leaveLobby', () => {
    lobby.players = lobby.players.filter(player => player.playerId !== socket.id);
    socket.leave('lobby');
    io.emit('updatePlayers', lobby.players);
    console.log(`Lobby state after leaveLobby: ${JSON.stringify(lobby)}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
