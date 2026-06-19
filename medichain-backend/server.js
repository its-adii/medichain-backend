import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const users = new Map();

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    users.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }
  });
});

app.set("io", io);
app.set("users", users);

server.listen(3000, () => {
  console.log("server is running on port : 3000");
});

