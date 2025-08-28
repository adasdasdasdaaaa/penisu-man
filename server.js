import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("join", (name) => {
    socket.data.name = name || "ゲスト";
    socket.broadcast.emit("system", `${socket.data.name} さんが参加しました`);
  });

  socket.on("chat", (msg) => {
    io.emit("chat", { from: socket.data.name, text: msg, ts: Date.now() });
  });

  socket.on("disconnect", () => {
    io.emit("system", `${socket.data.name} さんが退出しました`);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("Chat running on port " + PORT));
