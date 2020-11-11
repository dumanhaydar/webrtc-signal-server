const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// signaling
io.on('connection', function (socket) {
  socket.on('join', function (room) {
    var myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
    var numClients = myRoom.length;

    if (numClients < 2) {
      socket.join(room);
      socket.emit('joined', room, {isCaller: !Boolean(numClients)});
    } else {
      socket.emit('full', room);
    }
  });

  socket.on('ready', function (room){
    socket.broadcast.to(room).emit('ready');
  });

  socket.on('candidate', function (event){
    socket.broadcast.to(event.room).emit('candidate', event);
  });

  socket.on('offer', function(event){
    socket.broadcast.to(event.room).emit('offer',event.sdp);
  });

  socket.on('answer', function(event){
    socket.broadcast.to(event.room).emit('answer',event.sdp);
  });

  socket.on('disconnecting', () => {
    const rooms = Object.keys(socket.rooms);
    rooms.forEach(room => {
      socket.broadcast.to(room).emit('leave', 'bye')
    })
  });
});

// listener
http.listen(3000, function () {
  console.log('listening on *:3000');
});
