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
        origin: '*'
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Message broadcasting
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    // Typing event (sent to all except sender)
    socket.on('typing', () => {
        socket.broadcast.emit('typing', 'Someone is typing...');
    });

    // Stop typing event (to clear typing status)
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3002, () => {
    console.log('Server listening on port 3002');
});
