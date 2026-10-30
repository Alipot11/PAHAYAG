import { json } from "../../lib/auth.js";

function ageOn(birthdate, onDate) {
  const [by, bm, bd] = birthdate.split("-").map(Number);
  const [ey, em, ed] = onDate.split("-").map(Number);
  let age = ey - by;
  if (em < bm || (em === bm && ed < bd)) age--;
  return age;
}

export async function onRequestGet({ request, env }) {
  const p = new URL(request.url).searchParams;
  const competition = p.get("competition") || "";
  const barangay = p.get("barangay") || "";
  const q = (p.get("q") || "").trim().slice(0, 100);
  const year = Number(p.get("year")) || Number(env.EVENT_YEAR);

  const where = ["year = ?"];
  const params = [year];
  if (["lantern", "singing"].includes(competition)) {
    where.push("competition = ?");
    params.push(competition);
  }
  if (barangay) {
    where.push("barangay = ?");
    params.push(barangay);
  }
  if (q) {
    where.push("(full_name LIKE ? OR contact_number LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const { results } = await env.DB.prepare(
    `SELECT id, competition, full_name, contact_number, address, barangay,
            gender, birthdate, created_at
     FROM registrations
     WHERE ${where.join(" AND ")}
     ORDER BY id DESC
     LIMIT 2000`
  ).bind(...params).all();

  // Age is counted as of the event date (only meaningful for the current event year)
  const isCurrent = year === Number(env.EVENT_YEAR);
  const rows = results.map((r) => ({
    ...r,
    age: isCurrent ? ageOn(r.birthdate, env.EVENT_DATE) : null,
  }));

  const counts = await env.DB.prepare(
    "SELECT competition, COUNT(*) AS n FROM registrations WHERE year = ? GROUP BY competition"
  ).bind(year).all();

  const years = await env.DB.prepare(
    "SELECT DISTINCT year FROM registrations ORDER BY year DESC"
  ).all();

  return json({
    year,
    event_date: env.EVENT_DATE,
    rows,
    counts: counts.results,
    years: years.results.map((y) => y.year),
  });
}

export async function onRequestDelete({ request, env }) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return json({ error: "Invalid id." }, 400);

  await env.DB.prepare("DELETE FROM registrations WHERE id = ?").bind(id).run();
  return json({ ok: true });
}