const SHOW = 3;                 // how many posts to preview
const NEW_DAYS = 7;

function parseUtc(s) {
  return new Date(s.replace(" ", "T") + "Z");
}

function empty(box, text) {
  box.innerHTML = "";
  const p = document.createElement("p");
  p.className = "latest__empty";
  p.textContent = text;
  box.append(p);
}

async function loadLatest() {
  const box = document.getElementById("latest");
  try {
    const res = await fetch("/api/announcements");
    if (!res.ok) throw new Error("bad response");
    const posts = (await res.json()).slice(0, SHOW);

    if (posts.length === 0) {
      empty(box, "No announcements yet. Please check back soon.");
      return;
    }

    box.innerHTML = "";
    for (const p of posts) {
      const created = parseUtc(p.created_at);
      const isNew = Date.now() - created.getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;

      const art = document.createElement("article");
      art.className = "post" + (isNew ? " post--new" : "");

      const t = document.createElement("time");
      t.dateTime = created.toISOString();
      t.textContent = created.toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Manila",
      });

      const h = document.createElement("h3");
      h.textContent = p.title;

      const body = document.createElement("p");
      body.textContent = p.body;

      art.append(t, h, body);
      box.append(art);
    }
  } catch {
    empty(box, "Could not load announcements. Please refresh the page.");
  }
}
loadLatest();