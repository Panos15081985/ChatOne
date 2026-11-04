const express = require("express");
const db = require("./DBConfig");
const http = require("http");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SALT_ROUNDS = 10;

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
    },
});

// Online users: socket id -> email
const onlineUsers = new Map();

const getOnlineEmails = () => [...new Set(onlineUsers.values())];

io.on("connection", (socket) => {
    console.log("connected", socket.id);

    socket.on("email_send", (room, mail) => {
        onlineUsers.set(socket.id, mail);
        io.emit("users", getOnlineEmails());
        socket.join(room);
        socket.join(mail);
    });

    socket.on("send_message", (data) => {
        io.to(data.room).emit("receive_message", data);
    });

    socket.on("PrivatMsg", (conversationalist, randomRoom, MyEmail) => {
        socket.join(randomRoom);
        socket.to(conversationalist).emit("Privat_room", randomRoom, MyEmail, conversationalist);
        const data = { message: "Please wait until your partner accepts", Usermail: "server", Room: randomRoom };
        io.to(randomRoom).emit("receive_Privat_message", data);
    });

    socket.on("Privat_aksept_room", (PrivatRoom) => {
        socket.join(PrivatRoom);
        const data = { message: "You can communicate now!", Usermail: "server", Room: PrivatRoom };
        io.to(PrivatRoom).emit("receive_Privat_message", data);
    });

    socket.on("Privat_nicht_Aksept_room", (room) => {
        const data = { message: "Your partner doesn't want to talk to you", Usermail: "server", Room: room };
        socket.to(room).emit("receive_Privat_message", data);
    });

    socket.on("sendPrivatMessage", (message, PrivatRoom, Usermail) => {
        const data = { message: message, Usermail: Usermail, Room: PrivatRoom };
        io.to(PrivatRoom).emit("receive_Privat_message", data);
    });

    socket.on("leave_Join", (roomData) => {
        const data = { message: "Your partner has left the chat!", Usermail: "server", Room: roomData.Room };
        socket.to(roomData.Room).emit("receive_Privat_message", data);
        socket.leave(roomData.Room);
    });

    socket.on("Answer_delete", (roomData) => {
        socket.to(roomData.Usermail2).emit("Privat_room", "server", roomData.Usermail1, roomData.Usermail2);
    });

    socket.on("disconnect", () => {
        const disconnectName = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id);
        if (disconnectName) {
            io.emit("users", getOnlineEmails());
            io.emit("disconnectname", disconnectName);
        }
        console.log("disconnected", socket.id);
    });
});

app.post("/login", (req, res) => {
    const { usermail, userpass } = req.body;
    if (!usermail || !userpass) {
        return res.json({ success: "2" });
    }
    if (getOnlineEmails().includes(usermail)) {
        return res.json({ success: "3" });
    }

    db.query("SELECT uid, upassword FROM cuser WHERE mail = ?", [usermail], async (err, results) => {
        if (err) {
            console.error("Error during login:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (results.length === 0) {
            return res.json({ success: "2" });
        }
        try {
            const match = await bcrypt.compare(userpass, results[0].upassword);
            if (!match) {
                return res.json({ success: "2" });
            }
            res.status(200).json({ success: "1", uid: results[0].uid });
        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
});

app.post("/register", (req, res) => {
    const { usermail, userpass } = req.body;
    if (!usermail || !userpass) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    db.query("SELECT uid FROM cuser WHERE mail = ?", [usermail], async (err, results) => {
        if (err) {
            console.error("Error during registration:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (results.length !== 0) {
            return res.json({ message: "email exist" });
        }
        try {
            const hash = await bcrypt.hash(userpass, SALT_ROUNDS);
            db.query("INSERT INTO cuser (mail, upassword) VALUES (?, ?)", [usermail, hash], (insertErr) => {
                if (insertErr) {
                    console.error("Error during registration:", insertErr);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                res.status(200).json({ message: "Registration successful" });
            });
        } catch (error) {
            console.error("Error during registration:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
});

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
