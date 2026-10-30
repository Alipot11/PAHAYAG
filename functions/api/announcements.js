export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, title, body, created_at FROM announcements ORDER BY id DESC LIMIT 50"
  ).all();

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}