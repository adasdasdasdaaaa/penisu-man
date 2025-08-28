import express from "express";
import http from "http";
import { Server } from "socket.io";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PASSWORD = "114514";

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));

// --- パスワード入力フォームページ ---
app.get("/", (req, res) => {
  if (req.cookies.auth === "true") {
    // 認証済みなら直接チャットへ
    return res.redirect("/chat");
  }
  // フォーム表示
  res.send(`
    <h2>パスワードを入力してください</h2>
    <form method="POST" action="/login">
      <input name="password" placeholder="パスワード" type="password" required />
      <button>入室</button>
    </form>
  `);
});

// --- パスワードチェック ---
app.post("/login", (req, res) => {
  const pw = req.body.password;
  if (pw === PASSWORD) {
    res.cookie("auth", "true", { httpOnly: true });
    res.redirect("/chat");
  } else {
    res.send("パスワードが違います。<a href='/'>戻る</a>");
  }
});

// --- チャット画面（認証必須） ---
app.get("/chat", (req, res) => {
  if (req.cookies.auth !== "true") return res.redirect("/");
  res.sendFile(new URL("./public/index.html", import.meta.url).pathname);
});

// --- 画像アップロード ---
app.post("/upload", (req, res) => {
  if (!req.files || !req.files.image) return res.status(400).send("No file uploaded");

  const image = req.files.image;
  const uploadPath = `public/uploads/${image.name}`;

  image.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);
    io.emit("chat", { from: "画像", image: `/uploads/${image.name}`, ts: Date.now() });
    res.send("OK");
  });
});

// --- Socket.IO ---
io.on("connection", (socket) => {
  socket.on("join", (name) => {
    socket.data.name = name || "ゲスト";
    socket.broadcast.emit("system", `${socket.data.name} さんが参加しました`);
  });

  socket.on("chat", (msg) => {
    if (!socket.data.name) return;
    io.emit("chat", { from: socket.data.name, text: msg.text, image: msg.image, ts: Date.now() });
  });

  socket.on("disconnect", () => {
    if (!socket.data.name) return;
    io.emit("system", `${socket.data.name} さんが退出しました`);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("Chat running on port " + PORT));
