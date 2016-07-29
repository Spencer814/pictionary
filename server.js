var http = require('http'),
    express = require('express'),
    socket_io = require('socket.io'),
    app = express(),
    server = http.Server(app),
    io = socket_io(server);
    
server.listen(8080);

app.use(express.static(__dirname + '/public'));
console.log('Server running on 127.0.0.1:8080');

var numUsers = 0;

io.on('connection', function(socket) {
  var addedUser = false;
    
  socket.on('new message', function (data) {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });
    
  socket.on('add user', function(username) {
    if (addedUser) return;
    
    socket.username = username;
    numUsers++;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  console.log('A new user has connected: ', username);
  });
  
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('word', function(getWord) {
    socket.emit('word', getWord);
  });
  
  socket.on('draw', function(position) {
    socket.broadcast.emit('draw', position);
  });
  
  socket.on('erase', function(erase) {
    socket.broadcast.emit('erase', erase);
  });
  
  socket.on('guessed', function(guessed) {
    socket.broadcast.emit('guessed', guessed);
    console.log('Guess: ', guessed);
  });
  
  socket.on('disconnect', function(leave, username) {
    if (addedUser) {
      numUsers--;
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
    socket.broadcast.emit('leave', leave);
    console.log('A user has disconnected: ', username);
  });
});