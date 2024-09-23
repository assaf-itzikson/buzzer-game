const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

wss.on("connection", (ws) => {
    clients.push(ws);
    console.log("New client connected");

    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        handleMessage(ws, parsedMessage);
    });

    ws.on("close", () => {
        clients = clients.filter((client) => client !== ws);
        console.log("Client disconnected");
    });
});

const handleMessage = (ws, message) => {
    const messageHandlers = {
        join: (msg) => {
            ws.username = msg.username;
            ws.room = msg.room;
            broadcast({ type: "currentUsers", users: getUsersInRoom(msg.room) });
        },
        buzz: (msg) => {
            broadcast({ type: "userBuzzed", username: msg.username, room: msg.room });
        },
        queryUsers: (msg) => {
            ws.send(
                JSON.stringify({
                    type: "currentUsers",
                    users: getUsersInRoom(msg.room),
                })
            );
        },
        deleteRoom: (msg) => {
            broadcast({ type: "roomDeleted", room: msg.room });
            clients = clients.filter((client) => client.room !== msg.room);
        },
        queryRooms: () => {
            const rooms = [...new Set(clients.map((client) => client.room))];
            ws.send(JSON.stringify({ type: "updateRooms", rooms }));
        },
    };

    if (messageHandlers[message.type]) {
        messageHandlers[message.type](message);
    } else {
        console.error("Unknown message type:", message.type);
    }
};

const broadcast = (message) => {
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

const getUsersInRoom = (room) => {
    return clients
        .filter((client) => client.room === room)
        .map((client) => client.username);
};
