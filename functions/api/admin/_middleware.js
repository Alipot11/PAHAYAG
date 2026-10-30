import { isLoggedIn, json } from "../../lib/auth.js";

export async function onRequest({ request, env, next }) {
  const path = new URL(request.url).pathname;
  if (path === "/api/admin/login") return next();   // the only open one
  if (!(await isLoggedIn(request, env))) return json({ error: "Not logged in." }, 401);
  return next();
}