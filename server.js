const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'buzz') {
            broadcast({ type: 'userBuzzed', username: data.username });
            broadcast({ type: 'resetBuzz' });
        }
    });
});

function broadcast(message) {
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
