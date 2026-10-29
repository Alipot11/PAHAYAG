async function loadAnnouncements() {
  const box = document.getElementById("posts");
  try {
    const res = await fetch("/api/announcements");
    if (!res.ok) throw new Error("bad response");
    const posts = await res.json();

    if (posts.length === 0) {
      box.innerHTML = "<p>No announcements yet. Please check back soon.</p>";
      return;
    }

    box.innerHTML = "";
    for (const p of posts) {
      const art = document.createElement("article");
      art.className = "post";

      const h = document.createElement("h2");
      h.textContent = p.title;               // textContent keeps it safe from injected HTML

      const t = document.createElement("time");
      t.textContent = new Date(p.created_at.replace(" ", "T") + "Z")
        .toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

      const body = document.createElement("p");
      body.textContent = p.body;

      art.append(h, t, body);
      box.append(art);
    }
  } catch (e) {
    box.innerHTML = "<p>No announcements yet. Please check back soon.</p>";
  }
}
loadAnnouncements();