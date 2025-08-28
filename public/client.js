const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

const name = prompt("名前を入力してください") || "ゲスト";
socket.emit("join", name);

socket.on("chat", ({ from, text, ts }) => {
  const li = document.createElement("li");
  const time = new Date(ts).toLocaleTimeString();
  li.className = from === name ? "me" : "other";
  li.innerHTML = `<div class="bubble"><b>${from}</b><br>${text}<span>${time}</span></div>`;
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

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat", input.value);
    input.value = "";
  }
});
