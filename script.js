document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const usernameInput = document.getElementById('username');
    const buzzButton = document.getElementById('buzzButton');
    const userList = document.getElementById('userList');

    let users = [];
    let socket = new WebSocket('wss://buzzer-race.glitch.me');

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'userJoined') {
            users.push(message.username);
            updateUserList();
            buzzButton.disabled = false;
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
        if (username && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'join', username }));
            usernameInput.value = '';
        } else {
            console.error('WebSocket is not open. ReadyState:', socket.readyState);
        }
    });

    buzzButton.addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'buzz', username: usernameInput.value.trim() }));
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
