const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let users = [];

server.on('connection', (socket) => {
    // Send the current list of users to the newly connected client
    socket.send(JSON.stringify({ type: 'currentUsers', users: users.map(user => user.username) }));

    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            users.push({ username: data.username, socket });
            broadcast({ type: 'userJoined', username: data.username });
            broadcast({ type: 'currentUsers', users: users.map(user => user.username) });
        } else if (data.type === 'buzz') {
            broadcast({ type: 'userBuzzed', username: data.username });
            users = [];
        }
    });

    socket.on('close', () => {
        users = users.filter(user => user.socket !== socket);
        broadcast({ type: 'currentUsers', users: users.map(user => user.username) });
    });
});

function broadcast(message) {
    users.forEach(user => user.socket.send(JSON.stringify(message)));
}
