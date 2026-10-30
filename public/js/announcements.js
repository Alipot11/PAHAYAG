const NEW_DAYS = 7;   // posts newer than this get a "New" badge

function parseUtc(s) {
  return new Date(s.replace(" ", "T") + "Z");
}

function showEmpty(box, text) {
  box.innerHTML = "";
  const d = document.createElement("div");
  d.className = "feed__empty";
  d.textContent = text;
  box.append(d);
}

async function loadAnnouncements() {
  const box = document.getElementById("posts");
  try {
    const res = await fetch("/api/announcements");
    if (!res.ok) throw new Error("bad response");
    const posts = await res.json();

    if (posts.length === 0) {
      showEmpty(box, "No announcements yet. Please check back soon.");
      return;
    }

    box.innerHTML = "";
    for (const p of posts) {
      const created = parseUtc(p.created_at);
      const isNew = Date.now() - created.getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;

      const art = document.createElement("article");
      art.className = "post" + (isNew ? " post--new" : "");

      const meta = document.createElement("div");
      meta.className = "post__meta";

      if (isNew) {
        const badge = document.createElement("span");
        badge.className = "badge-new";
        badge.textContent = "New";
        meta.append(badge);
      }

      const t = document.createElement("time");
      t.dateTime = created.toISOString();
      t.textContent = created.toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Manila",
      });
      meta.append(t);

      const h = document.createElement("h2");
      h.textContent = p.title;          // textContent keeps it safe from injected HTML

      const body = document.createElement("p");
      body.textContent = p.body;

      art.append(meta, h, body);
      box.append(art);
    }
  } catch (e) {
    showEmpty(box, "Could not load announcements. Please refresh the page.");
  }
}
loadAnnouncements();