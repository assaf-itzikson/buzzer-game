document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const usernameInput = document.getElementById('username');
    const buzzButton = document.getElementById('buzzButton');
    const userList = document.getElementById('userList');
    const roomDisplay = document.getElementById('roomDisplay');
    const joinButton = document.getElementById('joinButton');

    let users = [];
    let currentUser = '';
    let currentRoom = 'P&C\'s Team Hour';
    let socket = new WebSocket('wss://house-of-games.glitch.me');
    const buzzerSound = new Audio('sounds/buzzer.wav');

    const messageHandlers = {
        currentUsers: (message) => {
            users = message.users;
            updateUserList();
        },
        userBuzzed: (message) => {
            buzzerSound.play().catch(error => console.error('Error playing sound:', error));
            alert(`${message.username} buzzed in first!`);
            buzzButton.disabled = true;
        },
        resetBuzz: () => {
            buzzButton.disabled = false;
        },
        roomDeleted: () => {
            alert('This room has been deleted by the admin.');
            users = [];
            updateUserList();
            buzzButton.disabled = true;
            sessionStorage.removeItem('currentUser');
        },
        updateRooms: (message) => {
            console.log('Rooms updated:', message.rooms);
        }
    };

    socket.onopen = () => {
        console.log('WebSocket connection established');
        setInterval(() => {
            if (socket.readyState === WebSocket.OPEN && currentRoom) {
                socket.send(JSON.stringify({ type: 'queryUsers', room: currentRoom }));
            }
        }, 1000); // Changed interval to 1000 milliseconds

        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = storedUser;
            socket.send(JSON.stringify({ type: 'join', username: currentUser, room: currentRoom }));
            roomDisplay.textContent = 'Game is in progress';
            buzzButton.disabled = false;
        }
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (messageHandlers[message.type]) {
            messageHandlers[message.type](message);
        } else {
            console.error('Unknown message type:', message.type);
        }
    };

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'join', username, room: currentRoom }));
                currentUser = username;
                sessionStorage.setItem('currentUser', currentUser);
                usernameInput.value = '';
                roomDisplay.textContent = 'Game is in progress';
                buzzButton.disabled = false;
            } else {
                console.error('WebSocket is not open. ReadyState:', socket.readyState);
            }
        }
    });

    joinButton.addEventListener('click', () => {
        userForm.dispatchEvent(new Event('submit'));
    });

    buzzButton.addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'buzz', username: currentUser, room: currentRoom }));
        } else {
            console.error('WebSocket is not open. ReadyState:', socket.readyState);
        }
    });

    function updateUserList() {
        userList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;

            if (user === currentUser) {
                const updateButton = document.createElement('button');
                updateButton.textContent = 'Update Username';
                updateButton.addEventListener('click', () => {
                    const newUsername = prompt('Enter new username:', user);
                    if (newUsername && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: 'updateUsername', oldUsername: user, newUsername, room: currentRoom }));
                        currentUser = newUsername;
                        sessionStorage.setItem('currentUser', currentUser);
                    } else {
                        console.error('WebSocket is not open. ReadyState:', socket.readyState);
                    }
                });
                li.appendChild(updateButton);
            }

            userList.appendChild(li);
        });
    }
});
