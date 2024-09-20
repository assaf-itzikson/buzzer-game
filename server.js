const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let rooms = { 'P&C\'s Team Hour': [] };

server.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            rooms['P&C\'s Team Hour'].push({ username: data.username, socket });
            broadcast('P&C\'s Team Hour', { type: 'currentUsers', users: rooms['P&C\'s Team Hour'].map(user => user.username) });
            broadcastAdmin({ type: 'updateRooms', rooms: Object.keys(rooms) });
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
