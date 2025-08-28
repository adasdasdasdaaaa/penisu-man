import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PASSWORD = "114514"; // 固定パスワード

app.use(bodyParser.urlencoded({ extended: true }));

// パスワード確認ページ
app.get("/", (req, res) => {
  res.send(`
    <form method="POST" action="/login">
      <input name="password" placeholder="パスワード" type="password" />
      <button>入室</button>
    </form>
  `);
});

// パスワードチェック
app.post("/login", (req, res) => {
  const pw = req.body.password;
  if (pw === PASSWORD) {
    res.redirect("/chat"); // 正しいときチャット画面へ
  } else {
    res.send("パスワードが違います。<a href='/'>戻る</a>");
  }
});

// チャット画面をパスワード認証済みのみ表示
app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(express.static("public")); // CSSやJS

// Socket.IO部分は以前と同じ
io.on("connection", (socket) => {
  socket.on("join", (name) => {
    socket.data.name = name || "ゲスト";
    socket.broadcast.emit("system", `${socket.data.name} さんが参加しました`);
  });

  socket.on("chat", (msg) => {
    if (!socket.data.name) return;
    io.emit("chat", { from: socket.data.name, text: msg, ts: Date.now() });
  });

  socket.on("disconnect", () => {
    if (!socket.data.name) return;
    io.emit("system", `${socket.data.name} さんが退出しました`);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("Chat running on port " + PORT));
