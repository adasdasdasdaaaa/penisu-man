import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PASSWORD = "114514";

// POSTデータを解析するミドルウェア
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// パスワード入力ページ
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
    res.redirect("/chat");
  } else {
    res.send("パスワードが違います。<a href='/'>戻る</a>");
  }
});

// チャット画面
app.get("/chat", (req, res) => {
  res.sendFile(new URL("./public/index.html", import.meta.url).pathname);
});

// 静的ファイル
app.use(express.static("public"));

// Socket.IO
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
