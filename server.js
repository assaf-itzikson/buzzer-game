const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let rooms = {};

server.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            if (!rooms[data.room]) {
                rooms[data.room] = [];
            }
            rooms[data.room].push({ username: data.username, socket });
            broadcast(data.room, { type: 'currentUsers', users: rooms[data.room].map(user => user.username) });
        } else if (data.type === 'buzz') {
            broadcast(data.room, { type: 'userBuzzed', username: data.username });
            rooms[data.room] = [];
            broadcast(data.room, { type: 'currentUsers', users: [] });
            broadcast(data.room, { type: 'resetBuzz' });
        } else if (data.type === 'queryUsers') {
            socket.send(JSON.stringify({ type: 'currentUsers', users: rooms[data.room].map(user => user.username) }));
        } else if (data.type === 'deleteRoom') {
            delete rooms[data.room];
            broadcast(data.room, { type: 'roomDeleted' });
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
