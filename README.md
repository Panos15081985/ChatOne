# Chat One

Real-time chat app with a public room and private one-to-one chats.

- **Client:** React, React Router, Socket.io client
- **Server:** Node.js, Express, Socket.io, MySQL

## Database

```sql
CREATE DATABASE chatone;
USE chatone;

CREATE TABLE cuser (
  uid INT AUTO_INCREMENT PRIMARY KEY,
  mail VARCHAR(255) NOT NULL UNIQUE,
  upassword VARCHAR(100) NOT NULL  -- bcrypt hash
);
```

## Run

### Server

```bash
cd server
npm install
DB_USER=root DB_PASSWORD=yourpassword DB_NAME=chatone npm start
```

Environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT` (default `3001`), `CLIENT_URL` (default `http://localhost:3000`).

### Client

```bash
cd client
npm install
npm start
```

Set `REACT_APP_SERVER_URL` if the server is not on `http://localhost:3001`.
