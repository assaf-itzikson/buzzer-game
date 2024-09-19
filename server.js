const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let rooms = { 'game room': [] };

server.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            rooms['game room'].push({ username: data.username, socket });
            broadcast('game room', { type: 'currentUsers', users: rooms['game room'].map(user => user.username) });
            broadcastAdmin({ type: 'updateRooms', rooms: Object.keys(rooms) });
        } else if (data.type === 'buzz') {
            broadcast('game room', { type: 'userBuzzed', username: data.username });
            broadcast('game room', { type: 'resetBuzz' });
        } else if (data.type === 'queryUsers') {
            socket.send(JSON.stringify({ type: 'currentUsers', users: rooms['game room'].map(user => user.username) }));
        } else if (data.type === 'deleteRoom') {
            if (rooms['game room']) {
                rooms['game room'].forEach(user => user.socket.send(JSON.stringify({ type: 'roomDeleted' })));
                rooms['game room'] = [];
                broadcastAdmin({ type: 'updateRooms', rooms: Object.keys(rooms) });
            }
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
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
