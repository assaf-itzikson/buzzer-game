# Buzzer Game

A simple buzzer game where users can join a room, buzz in, and the admin can manage users.

## Features

- Users can join a room and buzz in.
- Admin page to manage rooms and users.
- Real-time updates using WebSockets.

## Getting Started

### Prerequisites

- Node.js
- Yarn or npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/buzzer-game.git
    cd buzzer-game
    ```

2. Install dependencies:
    ```sh
    yarn install
    # or
    npm install
    ```

### Running the Application

1. Start the server:
    ```sh
    yarn start
    # or
    npm start
    ```

2. Open your browser and navigate to:
    - `http://localhost:8080` for the game page.
    - `http://localhost:8080/admin.html` for the admin page.

## Usage

### Game Page

1. Enter your name in the input field.
2. Click the "Join P&C's Team Hour Room" button to join the room.
3. Click the "Buzz In!" button to buzz in.

### Admin Page

1. View the list of rooms and users.
2. Click on a room to see the users in that room.
3. Remove users by clicking the "Remove User" button next to their name.

## Project Structure

- `server.js`: The server-side code handling WebSocket connections.
- `index.html`: The main game page.
- `admin.html`: The admin page.
- `script.js`: The client-side JavaScript for the game page.
- `style.css`: The CSS file for styling the pages.

## Dependencies

- `ws`: WebSocket library for Node.js.
- `vite`: Development server and build tool.

## Hosting

This project is connected to a `glitch.com` hosted server and can be used with GitHub Pages for the frontend. To set this up:

1. Deploy the server code to `glitch.com`.
2. Update the WebSocket URL in the client-side code to point to the `glitch.com` server.
3. Host the frontend on GitHub Pages by enabling GitHub Pages in the repository settings.

## License

This project is licensed under the MIT License.
