import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server is running on port : ${PORT}`);
});

