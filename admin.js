document.addEventListener('DOMContentLoaded', () => {
    const roomList = document.getElementById('roomList');
    const adminUserList = document.getElementById('adminUserList');
    let socket = new WebSocket('wss://house-of-games.glitch.me');
    let users = [];

    const messageHandlers = {
        updateRooms: (message) => {
            updateRoomList(message.rooms);
        },
        currentUsers: (message) => {
            users = message.users;
            updateAdminUserList();
        },
        removeUser: (message) => {
            users = users.filter(user => user !== message.username);
            updateAdminUserList();
        }
    };

    socket.onopen = () => {
        console.log('WebSocket connection established');
        socket.send(JSON.stringify({ type: 'queryRooms' }));
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (messageHandlers[message.type]) {
            messageHandlers[message.type](message);
        } else {
            console.error('Unknown message type:', message.type);
        }
    };

    function updateRoomList(rooms) {
        roomList.innerHTML = '';
        rooms.forEach(room => {
            const li = document.createElement('li');
            li.textContent = room + ' ';
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'deleteRoom', room }));
                } else {
                    console.error('WebSocket is not open. ReadyState:', socket.readyState);
                }
            });
            li.appendChild(deleteButton);
            li.addEventListener('click', () => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'queryUsers', room }));
                } else {
                    console.error('WebSocket is not open. ReadyState:', socket.readyState);
                }
            });
            roomList.appendChild(li);
        });
    }

    function updateAdminUserList() {
        adminUserList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove User';
            removeButton.addEventListener('click', () => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'removeUser', username: user, room: 'P&C\'s Team Hour' }));
                } else {
                    console.error('WebSocket is not open. ReadyState:', socket.readyState);
                }
            });

            li.appendChild(removeButton);
            adminUserList.appendChild(li);
        });
    }
});
