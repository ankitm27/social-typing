var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var server = require('http').Server(app);

server.listen('5000', function () {
    console.log("The http://127.0.0.1:5000/ is listening");
});

var io = require('socket.io')(server);

app.use(bodyParser.json());
app.use('/app', express.static(path.join(__dirname, 'app')));
app.use('/partials', express.static(path.join(__dirname, 'partials')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/:id', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function (client) {

    client.on('join', function (msg) {
        const roomId = JSON.parse(msg).roomId;
        console.log("join",msg);
        client.join(roomId);
        client.to(roomId).emit('join', msg);
    });

    client.on('name', function (msg) {
        const roomId = JSON.parse(msg).roomId;
        client.join(roomId);
        client.to(roomId).emit('name', msg);
    });

    client.on('messages', function (message) {
        const msg = JSON.parse(message);
        client.to(msg.roomId).emit('messages',message)
    });


    client.on('disconnect', function (message) {
        console.log("disconnect",message);
    });

    client.on('cursor', function (msg) {
        const roomId = JSON.parse(msg).roomId;
        console.log("cursor",msg);
        client.to(roomId).emit('cursor', msg);
    });
});
