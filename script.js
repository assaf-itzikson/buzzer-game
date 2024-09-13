document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const usernameInput = document.getElementById('username');
    const buzzButton = document.getElementById('buzzButton');
    const userList = document.getElementById('userList');

    let users = [];
    let socket = new WebSocket('ws://localhost:8080');

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
        if (username) {
            socket.send(JSON.stringify({ type: 'join', username }));
            usernameInput.value = '';
        }
    });

    buzzButton.addEventListener('click', () => {
        socket.send(JSON.stringify({ type: 'buzz' }));
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
