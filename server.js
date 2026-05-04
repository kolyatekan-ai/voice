const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Папка для HTML файлов
app.use(express.static('public'));

io.on('connection', socket => {
    // Когда кто-то заходит, добавляем его в общую комнату
    socket.on('join-room', roomId => {
        socket.join(roomId);
        
        // Сообщаем остальным, что появился новый участник
        socket.to(roomId).emit('user-connected', socket.id);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });

    // Пересылка данных для настройки прямого WebRTC соединения
    socket.on('offer', (userId, offer) => socket.to(userId).emit('offer', socket.id, offer));
    socket.on('answer', (userId, answer) => socket.to(userId).emit('answer', socket.id, answer));
    socket.on('candidate', (userId, candidate) => socket.to(userId).emit('candidate', socket.id, candidate));
});

// Запускаем сервер на порту 3000
http.listen(3000, () => {
    console.log('Голосовой чат работает! Открой http://localhost:3000');
});