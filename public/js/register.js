const form = document.getElementById("reg-form");
const msg = document.getElementById("msg");
const submitBtn = form.querySelector("button[type=submit]");

// Birthdate can't be in the future
document.getElementById("birthdate").max = new Date().toISOString().slice(0, 10);

function showMessage(kind, html) {
  msg.className = "msg msg--" + kind;
  msg.innerHTML = html;
  msg.hidden = false;
  msg.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  const payload = Object.fromEntries(new FormData(form));
  payload.competition = form.dataset.competition;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (!res.ok) {
      showMessage("error", "");
      msg.textContent = result.error || "Something went wrong. Please try again.";
      return;
    }

    form.reset();
    form.hidden = true;

    if (result.audition_url) {
      showMessage(
        "ok",
        `<strong>You're registered!</strong><br>
         Last step: upload your audition video using the button below.
         Use the same name you registered with.<br>
         <a class="btn btn--navy" href="${result.audition_url}" target="_blank" rel="noopener">Upload audition video</a>`
      );
    } else {
      showMessage("ok", "<strong>You're registered!</strong><br>Thank you. Watch the Announcements page for updates.");
    }
  } catch (err) {
    showMessage("error", "");
    msg.textContent = "Could not reach the server. Please check your connection and try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit registration";
  }
});