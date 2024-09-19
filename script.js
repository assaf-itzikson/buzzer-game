document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const usernameInput = document.getElementById('username');
    const buzzButton = document.getElementById('buzzButton');
    const userList = document.getElementById('userList');
    const roomDisplay = document.getElementById('roomDisplay');
    const joinButton = document.getElementById('joinButton');

    let users = [];
    let currentUser = '';
    let currentRoom = 'P&C\'s Team Hour Room';
    let socket = new WebSocket('wss://house-of-games.glitch.me');

    socket.onopen = () => {
        console.log('WebSocket connection established');
        setInterval(() => {
            if (socket.readyState === WebSocket.OPEN && currentRoom) {
                socket.send(JSON.stringify({ type: 'queryUsers', room: currentRoom }));
            }
        }, 100);
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'currentUsers') {
            users = message.users;
            updateUserList();
        } else if (message.type === 'userBuzzed') {
            alert(`${message.username} buzzed in first!`);
            buzzButton.disabled = true;
        } else if (message.type === 'resetBuzz') {
            buzzButton.disabled = false;
        } else if (message.type === 'roomDeleted') {
            alert('This room has been deleted by the admin.');
            users = [];
            updateUserList();
            buzzButton.disabled = true;
        }
    };

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'join', username, room: currentRoom }));
                currentUser = username;
                usernameInput.value = '';
                roomDisplay.textContent = `Current Room: ${currentRoom}`;
                buzzButton.disabled = false; // Enable buzz button when a user joins
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
            userList.appendChild(li);
        });
    }
});
