import { json, sessionCookie } from "../../lib/auth.js";

export async function onRequestPost({ request }) {
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", request, 0) });
}