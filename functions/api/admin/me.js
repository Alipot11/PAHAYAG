import { json } from "../../lib/auth.js";

export function onRequestGet() {
  return json({ ok: true });
}