import { json, passwordMatches, createSession, sessionCookie } from "../../lib/auth.js";

const WINDOW = 15 * 60; // seconds
const MAX_FAILS = 5;

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: "Server is not configured." }, 500);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const now = Math.floor(Date.now() / 1000);

  const row = await env.DB.prepare(
    "SELECT count, window_start FROM login_attempts WHERE ip = ?"
  ).bind(ip).first();

  let count = 0, start = now;
  if (row && now - row.window_start < WINDOW) { count = row.count; start = row.window_start; }
  if (count >= MAX_FAILS) {
    return json({ error: "Too many attempts. Please try again in 15 minutes." }, 429);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }

  if (!(await passwordMatches(String(body.password || ""), env))) {
    await env.DB.prepare(
      `INSERT INTO login_attempts (ip, count, window_start) VALUES (?, ?, ?)
       ON CONFLICT(ip) DO UPDATE SET count = excluded.count, window_start = excluded.window_start`
    ).bind(ip, count + 1, start).run();
    return json({ error: "Incorrect password." }, 401);
  }

  await env.DB.prepare("DELETE FROM login_attempts WHERE ip = ?").bind(ip).run();
  const token = await createSession(env);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token, request) });
}