const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const rooms = {};

// 🔌 ПОДКЛЮЧЕНИЕ
io.on('connection', socket => {

    // 👥 ВХОД В КОМНАТУ
    socket.on('join-room', room => {
        socket.join(room);

        if (!rooms[room]) rooms[room] = [];
        rooms[room].push(socket.id);

        // отправляем список уже подключенных
        socket.emit('room-users', rooms[room].filter(id => id !== socket.id));

        // уведомляем остальных
        socket.to(room).emit('user-connected', socket.id);

        socket.room = room;
    });

    // 📩 OFFER
    socket.on('offer', (to, desc) => {
        io.to(to).emit('offer', socket.id, desc);
    });

    // 📩 ANSWER
    socket.on('answer', (to, desc) => {
        io.to(to).emit('answer', socket.id, desc);
    });

    // 🧊 ICE
    socket.on('candidate', (to, candidate) => {
        io.to(to).emit('candidate', socket.id, candidate);
    });

    // ❌ ОТКЛЮЧЕНИЕ
    socket.on('disconnect', () => {
        const room = socket.room;
        if (!room || !rooms[room]) return;

        rooms[room] = rooms[room].filter(id => id !== socket.id);

        socket.to(room).emit('user-disconnected', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});