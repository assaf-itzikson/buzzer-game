const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'password123'
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.authenticated = true;
        res.status(200).send({ message: 'Login successful' });
    } else {
        res.status(401).send({ message: 'Invalid credentials' });
    }
});

app.use(express.static('public'));

let rooms = { 'P&C\'s Team Hour': [] };

wss.on('connection', (socket, req) => {
    if (!req.session || !req.session.authenticated) {
        socket.close();
        return;
    }

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

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
