import { isLoggedIn } from "../lib/auth.js";

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const loggedIn = await isLoggedIn(request, env);
  const isLoginPage = url.pathname === "/admin/login" || url.pathname === "/admin/login.html";

  // Logged-out visitors never get an admin page: straight to the login
  if (!isLoginPage && !loggedIn) {
    return Response.redirect(new URL("/admin/login", url), 302);
  }

  // Already logged in and opening the login page: straight to the dashboard
  if (isLoginPage && loggedIn) {
    return Response.redirect(new URL("/admin/", url), 302);
  }

  // Serve the page, and tell browsers not to keep a copy of it
  const response = await next();
  const out = new Response(response.body, response);
  out.headers.set("Cache-Control", "no-store");
  return out;
}