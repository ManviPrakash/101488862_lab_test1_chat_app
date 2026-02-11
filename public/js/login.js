// If already logged in, go rooms
const session = JSON.parse(localStorage.getItem("session") || "null");
if (session?.username) window.location.href = "/views/rooms.html";

$("#btnLogin").on("click", async () => {
  $("#msg").text("");

  const payload = {
    username: $("#username").val().trim(),
    password: $("#password").val()
  };

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!data.ok) return $("#msg").text(data.message || "Login failed.");

  localStorage.setItem("session", JSON.stringify({ username: data.user.username }));
  window.location.href = "/views/rooms.html";
});
