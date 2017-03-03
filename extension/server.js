var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use('/public', express.static('public'));
io.on('connection', function(client){
  setInterval(function() {
    client.emit('message', { time: Date.now() });
  }, 3000);
});
server.listen(3000);
