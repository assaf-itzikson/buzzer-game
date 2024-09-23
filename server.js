const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let clients = [];
let buzzed = false;

server.on('connection', (ws) => {
    clients.push(ws);
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type && messageHandlers[parsedMessage.type]) {
                messageHandlers[parsedMessage.type](ws, parsedMessage);
            } else {
                console.error('Unknown or missing message type:', parsedMessage.type);
            }
        } catch (error) {
            console.error('Invalid message format:', error);
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected');
    });
});

const messageHandlers = {
    join: (ws, msg) => {
        ws.username = msg.username;
        ws.room = msg.room;
        broadcastToRoom(msg.room, { type: 'currentUsers', users: getUsersInRoom(msg.room) });
    },
    buzz: (ws, msg) => {
        if (!buzzed) {
            buzzed = true;
            broadcastToRoom(msg.room, { type: 'userBuzzed', username: msg.username });
        }
    },
    queryUsers: (ws, msg) => {
        ws.send(JSON.stringify({ type: 'currentUsers', users: getUsersInRoom(msg.room) }));
    },
    deleteRoom: (ws, msg) => {
        broadcastToRoom(msg.room, { type: 'roomDeleted' });
        clients = clients.filter(client => client.room !== msg.room);
    },
    queryRooms: (ws) => {
        const rooms = [...new Set(clients.map(client => client.room))];
        ws.send(JSON.stringify({ type: 'updateRooms', rooms }));
    },
    resetBuzz: () => {
        buzzed = false;
        broadcast({ type: 'resetBuzz' });
    }
};

const broadcastToRoom = (room, message) => {
    clients.forEach(client => {
        if (client.room === room && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

const broadcast = (message) => {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

const getUsersInRoom = (room) => {
    return clients.filter(client => client.room === room).map(client => client.username);
};
