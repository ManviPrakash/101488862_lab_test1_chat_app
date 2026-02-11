$("#btnSignup").on("click", async () => {
    $("#msg").text("");
  
    const payload = {
      username: $("#username").val().trim(),
      firstname: $("#firstname").val().trim(),
      lastname: $("#lastname").val().trim(),
      password: $("#password").val()
    };
  
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  
    const data = await res.json();
    if (!data.ok) return $("#msg").text(data.message || "Signup failed.");
  
    alert(data.message);
    window.location.href = "/views/login.html";
  });
  