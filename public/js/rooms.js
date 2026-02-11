const session = JSON.parse(localStorage.getItem("session") || "null");
if (!session?.username) window.location.href = "/views/login.html";
$("#who").text(session.username);

$("#btnLogout").on("click", () => {
  localStorage.removeItem("session");
  localStorage.removeItem("room");
  window.location.href = "/views/login.html";
});

(async () => {
  const res = await fetch("/api/rooms");
  const data = await res.json();
  $("#room").empty();
  data.rooms.forEach(r => $("#room").append(`<option value="${r}">${r}</option>`));
})();

$("#btnJoin").on("click", () => {
  const room = $("#room").val();
  localStorage.setItem("room", room);
  window.location.href = "/views/chat.html";
});
