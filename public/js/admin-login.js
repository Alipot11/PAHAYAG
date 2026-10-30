const form = document.getElementById("login-form");
const msg = document.getElementById("msg");

function showError(text) {
  msg.className = "msg msg--error";
  msg.textContent = text;
  msg.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.hidden = true;
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: document.getElementById("password").value }),
    });
    const result = await res.json();
    if (!res.ok) return showError(result.error || "Login failed.");
    location.href = "/admin/";
  } catch {
    showError("Could not reach the server. Please try again.");
  }
});