const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const basicAuth = require('express-basic-auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Use environment variables for authentication
const users = {};
users[process.env.ADMIN_USER] = process.env.ADMIN_PASS;

app.use(basicAuth({
    users: users,
    challenge: true
}));

app.use(express.json());
app.use(express.static('public'));

let rooms = { 'P&C\'s Team Hour': [] };

wss.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            rooms['P&C\'s Team Hour'].push({ username: data.username, socket });
            broadcast('P&C\'s Team Hour', { type: 'currentUsers', users: rooms['P&C\'s Team Hour'].map(user => user.username) });
            broadcastAdmin({ type: 'newUser', username: data.username });
        } else if (data.type === 'buzz') {
            broadcast('P&C\'s Team Hour', { type: 'userBuzzed', username: data.username });
            broadcast('P&C\'s Team Hour', { type: 'resetBuzz' });
        } else if (data.type === 'queryUsers') {
            socket.send(JSON.stringify({ type: 'currentUsers', users: rooms['P&C\'s Team Hour'].map(user => user.username) }));
        } else if (data.type === 'deleteRoom') {
            if (rooms['P&C\'s Team Hour']) {
                rooms['P&C\'s Team Hour'].forEach(user => user.socket.send(JSON.stringify({ type: 'roomDeleted' })));
                rooms['P&C\'s Team Hour'] = [];
                broadcastAdmin({ type: 'updateRooms', rooms: Object.keys(rooms) });
            }
        } else if (data.type === 'queryRooms') {
            socket.send(JSON.stringify({ type: 'updateRooms', rooms: Object.keys(rooms) }));
        } else if (data.type === 'removeUser') {
            rooms['P&C\'s Team Hour'] = rooms['P&C\'s Team Hour'].filter(user => user.username !== data.username);
            broadcast('P&C\'s Team Hour', { type: 'currentUsers', users: rooms['P&C\'s Team Hour'].map(user => user.username) });
            broadcastAdmin({ type: 'removeUser', username: data.username });
        }
    });

    socket.on('close', () => {
        for (let room in rooms) {
            rooms[room] = rooms[room].filter(user => user.socket !== socket);
            broadcast(room, { type: 'currentUsers', users: rooms[room].map(user => user.username) });
        }
    });
});

function broadcast(room, message) {
    if (rooms[room]) {
        rooms[room].forEach(user => user.socket.send(JSON.stringify(message)));
    }
}

function broadcastAdmin(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
