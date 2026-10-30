const COLUMNS = [
  ["id", "ID"],
  ["competition", "Competition"],
  ["full_name", "Full name"],
  ["contact_number", "Contact number"],
  ["address", "Purok / Sitio / Street"],
  ["barangay", "Barangay"],
  ["gender", "Gender"],
  ["birthdate", "Birthdate"],
  ["year", "Year"],
  ["created_at", "Registered at (UTC)"],
];

// Quote every cell. Text starting with = + - @ is prefixed with ' so a spreadsheet
// can't treat it as a formula (the contact number is already restricted to digits and + ( ) -).
function csvCell(value, guard = true) {
  let s = value == null ? "" : String(value);
  if (guard && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}

export async function onRequestGet({ request, env }) {
  const p = new URL(request.url).searchParams;
  const competition = p.get("competition") || "";
  const barangay = p.get("barangay") || "";
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

  const { results } = await env.DB.prepare(
    `SELECT ${COLUMNS.map((c) => c[0]).join(", ")}
     FROM registrations
     WHERE ${where.join(" AND ")}
     ORDER BY competition, id`
  ).bind(...params).all();

  const header = COLUMNS.map((c) => csvCell(c[1], false)).join(",");
  const lines = results.map((r) =>
    COLUMNS.map(([key]) => csvCell(r[key], key !== "contact_number")).join(",")
  );

  // The \uFEFF at the start makes Excel read accented letters correctly
  const csv = "\uFEFF" + [header, ...lines].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pahayag-registrations-${year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}