const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const imageInput = document.getElementById("imageInput");
const messages = document.getElementById("messages");

const name = prompt("名前を入力してください") || "ゲスト";
socket.emit("join", name);

// 文字 or 画像送信
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // テキスト送信
  if (input.value) {
    socket.emit("chat", { text: input.value });
    input.value = "";
  }

  // 画像送信
  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const formData = new FormData();
    formData.append("image", file);
    fetch("/upload", { method: "POST", body: formData });
    imageInput.value = "";
  }
});

// メッセージ受信
socket.on("chat", ({ from, text, image, ts }) => {
  const li = document.createElement("li");
  li.className = from === name ? "me" : "other";

  let content = `<div class="bubble"><b>${from}</b>`;
  if (text) content += `<br>${text}`;
  if (image) content += `<br><img src="${image}" style="max-width:200px; border-radius:8px;">`;
  content += `<span>${new Date(ts).toLocaleTimeString()}</span></div>`;

  li.innerHTML = content;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// システムメッセージ
socket.on("system", (msg) => {
  const li = document.createElement("li");
  li.className = "system";
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
