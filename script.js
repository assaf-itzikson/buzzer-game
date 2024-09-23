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
    let buzzed = false;
    let debounce = false;

    const messageHandlers = {
        currentUsers: (message) => {
            users = message.users;
            updateUserList();
        },
        userBuzzed: (message) => {
            buzzerSound.play().catch(error => console.error('Error playing sound:', error));
            notifyUser(`${message.username} buzzed in first!`);
            buzzButton.disabled = true;
            buzzed = true;
        },
        resetBuzz: () => {
            buzzButton.disabled = false;
            buzzed = false;
            debounce = false;
        },
        roomDeleted: () => {
            notifyUser('This room has been deleted by the admin.');
            users = [];
            updateUserList();
            buzzButton.disabled = true;
            sessionStorage.removeItem('currentUser');
        }
    };

    socket.onopen = () => {
        console.log('WebSocket connection established');
        setInterval(() => {
            if (socket.readyState === WebSocket.OPEN && currentRoom) {
                socket.send(JSON.stringify({ type: 'queryUsers', room: currentRoom }));
            }
        }, 100);

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

    const handleBuzz = () => {
        if (socket.readyState === WebSocket.OPEN && !buzzed && !debounce) {
            debounce = true;
            socket.send(JSON.stringify({ type: 'buzz', username: currentUser, room: currentRoom }));
        } else {
            console.error('WebSocket is not open, user already buzzed, or debounce is active. ReadyState:', socket.readyState);
        }
    };

    buzzButton.addEventListener('click', handleBuzz);

    // Add touch event listener for mobile devices
    buzzButton.addEventListener('touchstart', handleBuzz);

    function updateUserList() {
        userList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            userList.appendChild(li);
        });
    }

    function notifyUser(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
});
