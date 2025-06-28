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

let users = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join room', ({ username, room }) => {
        socket.join(room);
        users[socket.id] = { username, room };

        socket.to(room).emit('user joined', `${username} joined the room`);
        console.log(`${username} joined room: ${room}`);
    });

    socket.on('chat message', (message) => {
        const user = users[socket.id];
        if (user) {
            io.to(user.room).emit('chat message', {
                sender: user.username,
                text: message
            });
        }
    });

    socket.on('private message', ({ toSocketId, message }) => {
        const sender = users[socket.id]?.username || 'Anonymous';
        socket.to(toSocketId).emit('private message', {
            from: sender,
            text: message
        });
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            socket.to(user.room).emit('user left', `${user.username} left the room`);
            delete users[socket.id];
        }
        console.log('User disconnected:', socket.id);
    });

    socket.on('get users', () => {
        const userList = Object.entries(users).map(([id, { username, room }]) => ({
            socketId: id,
            username,
            room
        }));
        socket.emit('user list', userList);
    });
});

server.listen(3003, () => {
    console.log('Server listening on port 3003');
});
