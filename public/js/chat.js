const session = JSON.parse(localStorage.getItem("session") || "null");
const room = localStorage.getItem("room");

if (!session?.username) window.location.href = "/views/login.html";
if (!room) window.location.href = "/views/rooms.html";

$("#who").text(session.username);
$("#roomName").text(room);

const socket = io();
socket.emit("register", { username: session.username });
socket.emit("joinRoom", { username: session.username, room });

function esc(s) { return $("<div>").text(s ?? "").html(); }

function addRoomMsg(html) {
  $("#chatBox").append(html);
  $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
}

function addPMMsg(html) {
  $("#pmBox").append(html);
  $("#pmBox").scrollTop($("#pmBox")[0].scrollHeight);
}

// ---------- ROOM HISTORY ----------
socket.on("roomHistory", (msgs) => {
  $("#chatBox").empty();
  msgs.forEach(m => {
    addRoomMsg(`
      <div class="msg">
        <div class="meta"><b>${esc(m.from_user)}</b> • ${esc(m.date_sent)}</div>
        <div>${esc(m.message)}</div>
      </div>
    `);
  });
});

// ---------- SYSTEM ----------
socket.on("system", (m) => {
  addRoomMsg(`
    <div class="msg system">
      <div class="meta"><b>System</b> • ${esc(m.date_sent)}</div>
      <div>${esc(m.message)}</div>
    </div>
  `);
});

// ---------- ROOM MESSAGE ----------
socket.on("groupMessage", (m) => {
  const mine = m.from_user === session.username ? "mine" : "";
  addRoomMsg(`
    <div class="msg ${mine}">
      <div class="meta"><b>${esc(m.from_user)}</b> • ${esc(m.date_sent)}</div>
      <div>${esc(m.message)}</div>
    </div>
  `);

  // optional: clear typing text when a message arrives
  $("#typing").text("");
});

// ---------- ONLINE USERS ----------
socket.on("onlineUsers", (users) => {
  $("#online").empty();
  $("#toUser").empty();

  users.forEach(u => {
    $("#online").append(`<li>${esc(u)}</li>`);
    if (u !== session.username) {
      $("#toUser").append(`<option value="${esc(u)}">${esc(u)}</option>`);
    }
  });

  if ($("#toUser option").length === 0) {
    $("#toUser").append(`<option value="">(no other users online)</option>`);
  }
});

// ================= ROOM TYPING INDICATOR =================
let roomTypingTimer = null;

// when user types in ROOM input
$("#message").on("input", () => {
  socket.emit("roomTyping", { from_user: session.username, room, isTyping: true });

  clearTimeout(roomTypingTimer);
  roomTypingTimer = setTimeout(() => {
    socket.emit("roomTyping", { from_user: session.username, room, isTyping: false });
  }, 700);
});

// when other user is typing in the ROOM
socket.on("roomTyping", ({ from_user, isTyping }) => {
  $("#typing").text(isTyping ? `${from_user} is typing...` : "");
});

// ---------- SEND ROOM MESSAGE ----------
$("#btnSendGroup").on("click", () => {
  const message = $("#message").val().trim();
  if (!message) return;

  socket.emit("groupMessage", { from_user: session.username, room, message });

  // stop typing immediately after sending
  socket.emit("roomTyping", { from_user: session.username, room, isTyping: false });
  $("#typing").text("");

  $("#message").val("");
});

// ---------- LEAVE ROOM ----------
$("#btnLeave").on("click", () => {
  // stop typing (just in case) before leaving
  socket.emit("roomTyping", { from_user: session.username, room, isTyping: false });

  socket.emit("leaveRoom", { username: session.username, room });
  localStorage.removeItem("room");
  window.location.href = "/views/rooms.html";
});

// ---------- LOGOUT ----------
$("#btnLogout").on("click", () => {
  localStorage.removeItem("session");
  localStorage.removeItem("room");
  window.location.href = "/views/login.html";
});

// ================= PRIVATE MESSAGES + TYPING =================
let pmTypingTimer = null;

$("#pm").on("input", () => {
  const to_user = $("#toUser").val();
  if (!to_user) return;

  socket.emit("privateTyping", { from_user: session.username, to_user, isTyping: true });

  clearTimeout(pmTypingTimer);
  pmTypingTimer = setTimeout(() => {
    socket.emit("privateTyping", { from_user: session.username, to_user, isTyping: false });
  }, 700);
});

$("#btnSendPM").on("click", () => {
  const to_user = $("#toUser").val();
  const message = $("#pm").val().trim();
  if (!to_user || !message) return;

  socket.emit("privateMessage", { from_user: session.username, to_user, message });

  $("#pm").val("");
  socket.emit("privateTyping", { from_user: session.username, to_user, isTyping: false });
});

// ✅ PRIVATE MESSAGES GO TO pmBox (NOT room chat)
socket.on("privateMessage", (m) => {
  const mine = m.from_user === session.username;
  const title = mine ? `You → ${m.to_user}` : `${m.from_user} → You`;

  addPMMsg(`
    <div class="msg ${mine ? "mine" : ""}" style="border-left:4px solid #198754;">
      <div class="meta"><b>${esc(title)}</b> • ${esc(m.date_sent)}</div>
      <div>${esc(m.message)}</div>
    </div>
  `);
});

// typing indicator for private chat
socket.on("privateTyping", ({ from_user, isTyping }) => {
  $("#pmTyping").text(isTyping ? `${from_user} is typing...` : "");
});
