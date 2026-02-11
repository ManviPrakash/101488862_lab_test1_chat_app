require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");

const User = require("./models/User");
const GroupMessage = require("./models/GroupMessage");
const PrivateMessage = require("./models/PrivateMessage");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));

const server = http.createServer(app);
const io = new Server(server);

const ROOMS = ["devops", "cloud computing", "covid19", "sports", "nodeJS"];

// Mongo connect
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

function nowString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const yyyy = d.getFullYear();
  let hh = d.getHours();
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  const min = pad(d.getMinutes());
  return `${mm}-${dd}-${yyyy} ${pad(hh)}:${min} ${ampm}`;
}

// Pages
app.get("/", (req, res) => res.redirect("/views/login.html"));

// API: rooms list
app.get("/api/rooms", (req, res) => res.json({ rooms: ROOMS }));

// API: signup
app.post("/api/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ ok: false, message: "All fields are required." });
    }

    const exists = await User.findOne({ username: username.trim() });
    if (exists) return res.status(409).json({ ok: false, message: "Username already exists." });

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      username: username.trim(),
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      password: hash,
      createon: nowString()
    });

    res.json({ ok: true, message: "Signup successful. Please login." });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Server error.", error: e.message });
  }
});

// API: login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, message: "Missing fields." });

    const user = await User.findOne({ username: username.trim() });
    if (!user) return res.status(401).json({ ok: false, message: "Invalid username/password." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ ok: false, message: "Invalid username/password." });

    res.json({ ok: true, message: "Login successful.", user: { username: user.username } });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Server error.", error: e.message });
  }
});

// -------- Socket.io logic --------
/**
 * We keep a map: username -> socket.id
 * so we can send private messages + typing to the right person.
 */
const userSocketMap = new Map();

io.on("connection", (socket) => {
  // register user (after login)
  socket.on("register", ({ username }) => {
    if (!username) return;
    socket.data.username = username;
    userSocketMap.set(username, socket.id);
    io.emit("onlineUsers", Array.from(userSocketMap.keys()));
  });

  // join room
  socket.on("joinRoom", async ({ username, room }) => {
    if (!username || !room) return;

    socket.join(room);
    socket.data.room = room;

    // load last 50 group messages for this room
    const history = await GroupMessage.find({ room }).sort({ _id: -1 }).limit(50).lean();
    socket.emit("roomHistory", history.reverse());

    // tell room user joined (optional system msg)
    io.to(room).emit("system", { message: `${username} joined ${room}`, date_sent: nowString() });
  });

  // leave room
  socket.on("leaveRoom", ({ username, room }) => {
    if (!room) return;
    socket.leave(room);
    socket.data.room = null;
    io.to(room).emit("system", { message: `${username} left ${room}`, date_sent: nowString() });
  });

  // group message
  socket.on("groupMessage", async ({ from_user, room, message }) => {
    if (!from_user || !room || !message?.trim()) return;

    const doc = await GroupMessage.create({
      from_user,
      room,
      message: message.trim(),
      date_sent: nowString()
    });

    io.to(room).emit("groupMessage", doc);
  });

  // private message
  socket.on("privateMessage", async ({ from_user, to_user, message }) => {
    if (!from_user || !to_user || !message?.trim()) return;

    const doc = await PrivateMessage.create({
      from_user,
      to_user,
      message: message.trim(),
      date_sent: nowString()
    });

    // send to sender + receiver (if online)
    socket.emit("privateMessage", doc);
    const toSocketId = userSocketMap.get(to_user);
    if (toSocketId) io.to(toSocketId).emit("privateMessage", doc);
  });

  // typing indicator (PRIVATE)
  socket.on("privateTyping", ({ from_user, to_user, isTyping }) => {
    const toSocketId = userSocketMap.get(to_user);
    if (!toSocketId) return;
    io.to(toSocketId).emit("privateTyping", { from_user, isTyping: !!isTyping });
  });

  socket.on("disconnect", () => {
    const u = socket.data.username;
    if (u) userSocketMap.delete(u);
    io.emit("onlineUsers", Array.from(userSocketMap.keys()));
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server running on http://localhost:${process.env.PORT || 3000}`);
});
