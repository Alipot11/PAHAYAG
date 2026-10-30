import { json } from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }

  const title = String(data.title || "").trim().slice(0, 150);
  const body = String(data.body || "").trim().slice(0, 5000);
  if (!title || !body) return json({ error: "Title and message are required." }, 400);

  await env.DB.prepare("INSERT INTO announcements (title, body) VALUES (?, ?)")
    .bind(title, body).run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return json({ error: "Invalid id." }, 400);

  await env.DB.prepare("DELETE FROM announcements WHERE id = ?").bind(id).run();
  return json({ ok: true });
}