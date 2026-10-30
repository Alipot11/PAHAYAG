const COOKIE = "pahayag_session";
const SESSION_SECONDS = 8 * 60 * 60; // 8 hours
const enc = new TextEncoder();

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Constant-time string comparison
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function passwordMatches(input, env) {
  const a = await hmac(env.SESSION_SECRET, "pw:" + input);
  const b = await hmac(env.SESSION_SECRET, "pw:" + env.ADMIN_PASSWORD);
  return safeEqual(a, b);
}

export async function createSession(env) {
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  return `${expires}.${await hmac(env.SESSION_SECRET, expires)}`;
}

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export async function isLoggedIn(request, env) {
  if (!env.SESSION_SECRET) return false;
  const token = getCookie(request, COOKIE);
  if (!token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || !(Number(expires) > Date.now())) return false;
  return safeEqual(sig, await hmac(env.SESSION_SECRET, expires));
}

export function sessionCookie(token, request, maxAge = SESSION_SECONDS) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}