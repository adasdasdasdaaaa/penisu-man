const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const imageInput = document.getElementById("imageInput");
const messages = document.getElementById("messages");

const name = prompt("名前を入力してください") || "ゲスト";
socket.emit("join", name);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit("chat", { text: input.value });
    input.value = "";
  }

  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const formData = new FormData();
    formData.append("image", file);
    fetch("/upload", { method: "POST", body: formData });
    imageInput.value = "";
  }
});

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

socket.on("system", (msg) => {
  const li = document.createElement("li");
  li.className = "system";
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
// 通知用音を用意
const notificationSound = new Audio("/notification.mp3"); // public に notification.mp3 を置く

// ブラウザ通知の許可を求める
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

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

  // 自分以外からのメッセージなら通知
  if (from !== name) {
    notificationSound.play().catch(() => {}); // 音再生
    if (Notification.permission === "granted") {
      new Notification(`新しいメッセージ from ${from}`, {
        body: text || "画像が送信されました",
        icon: "/favicon.ico" // 任意
      });
    }
  }
});
