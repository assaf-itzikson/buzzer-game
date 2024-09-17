document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const usernameInput = document.getElementById('username');
    const buzzButton = document.getElementById('buzzButton');
    const deleteButton = document.getElementById('deleteButton');
    const userList = document.getElementById('userList');

    let users = [];
    let currentUser = '';
    let socket = new WebSocket('wss://house-of-games.glitch.me:8080');

    socket.onopen = () => {
        console.log('WebSocket connection established');
        setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'queryUsers' }));
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
                socket.send(JSON.stringify({ type: 'join', username }));
                currentUser = username;
                usernameInput.value = '';
            } else {
                console.error('WebSocket is not open. ReadyState:', socket.readyState);
            }
        }
    });

    buzzButton.addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'buzz', username: currentUser }));
        } else {
            console.error('WebSocket is not open. ReadyState:', socket.readyState);
        }
    });

    deleteButton.addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'deleteUsers' }));
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
