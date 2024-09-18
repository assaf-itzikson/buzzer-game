const WebSocket = require('ws');
const fs = require('fs');
const server = new WebSocket.Server({ port: 8080 });

let users = [];

// Load users from persistent storage
try {
    if (fs.existsSync('users.json')) {
        const data = fs.readFileSync('users.json', 'utf8');
        users = JSON.parse(data);
        if (!Array.isArray(users)) {
            users = [];
        }
    }
} catch (error) {
    console.error('Error reading users.json:', error);
    users = [];
}

server.on('connection', (socket) => {
    // Send the current list of users to the newly connected client
    socket.send(JSON.stringify({ type: 'currentUsers', users: users.map(user => user.username) }));

    socket.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            users.push({ username: data.username, socket });
            saveUsers();
            broadcast({ type: 'currentUsers', users: users.map(user => user.username) });
        } else if (data.type === 'buzz') {
            broadcast({ type: 'userBuzzed', username: data.username });
            users = [];
            saveUsers();
            broadcast({ type: 'currentUsers', users: [] });
            broadcast({ type: 'resetBuzz' });
        } else if (data.type === 'queryUsers') {
            socket.send(JSON.stringify({ type: 'currentUsers', users: users.map(user => user.username) }));
        } else if (data.type === 'deleteUsers') {
            users = [];
            saveUsers();
            broadcast({ type: 'currentUsers', users: [] });
        }
    });

    socket.on('close', () => {
        users = users.filter(user => user.socket !== socket);
        saveUsers();
        broadcast({ type: 'currentUsers', users: users.map(user => user.username) });
    });
});

function broadcast(message) {
    users.forEach(user => user.socket.send(JSON.stringify(message)));
}

function saveUsers() {
    try {
        fs.writeFileSync('users.json', JSON.stringify(users.map(user => ({ username: user.username }))));
    } catch (error) {
        console.error('Error writing to users.json:', error);
    }
}
