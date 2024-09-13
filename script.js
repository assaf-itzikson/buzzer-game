document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const usernameInput = document.getElementById('username');
    const buzzButton = document.getElementById('buzzButton');
    const userList = document.getElementById('userList');

    let users = [];

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username && !users.includes(username)) {
            users.push(username);
            updateUserList();
            usernameInput.value = '';
            buzzButton.disabled = false;
        }
    });

    buzzButton.addEventListener('click', () => {
        const buzzedUser = users.shift();
        if (buzzedUser) {
            alert(`${buzzedUser} buzzed in!`);
            updateUserList();
            if (users.length === 0) {
                buzzButton.disabled = true;
            }
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
