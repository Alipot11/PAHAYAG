const msg = document.getElementById("msg");
const postsBox = document.getElementById("posts");

// Any 401 means "not logged in": send to the login page
async function api(path, options = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  if (res.status === 401) {
    location.href = "/admin/login";
    throw new Error("Not logged in");
  }
  return res;
}

function showMessage(kind, text) {
  msg.className = "msg msg--" + kind;
  msg.textContent = text;
  msg.hidden = false;
}

async function loadPosts() {
  const res = await fetch("/api/announcements");
  const posts = await res.json();
  postsBox.innerHTML = "";
  if (posts.length === 0) {
    postsBox.innerHTML = "<p>No announcements yet.</p>";
    return;
  }
  for (const p of posts) {
    const art = document.createElement("article");
    art.className = "post";

    const h = document.createElement("h2");
    h.textContent = p.title;

    const t = document.createElement("time");
    t.textContent = p.created_at;

    const body = document.createElement("p");
    body.textContent = p.body;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn btn--outline-dark";
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      if (!confirm(`Delete "${p.title}"?`)) return;
      await api(`/api/admin/announcements?id=${p.id}`, { method: "DELETE" });
      loadPosts();
    });

    art.append(h, t, body, del);
    postsBox.append(art);
  }
}

document.getElementById("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.hidden = true;
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;

  const res = await api("/api/admin/announcements", {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });
  const result = await res.json();
  if (!res.ok) return showMessage("error", result.error || "Could not post.");

  e.target.reset();
  showMessage("ok", "Announcement posted.");
  loadPosts();
});

document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  location.href = "/admin/login";
});

// Start: confirm we're logged in, then load
api("/api/admin/me").then(loadPosts).catch(() => {});