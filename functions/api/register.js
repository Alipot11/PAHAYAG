const COMPETITIONS = ["lantern", "singing"];
const GENDERS = ["Male", "Female", "Prefer not to say"];
const MIN_SINGING_AGE = 15;
const BARANGAYS = [
  "Agsao", "Agutay", "Ambulong", "Dulangan", "Ipil",
  "Jao-asan", "Poblacion", "Silum", "Tampayan",
];
// Competitions open only to residents of Magdiwang
const RESIDENT_ONLY = ["lantern"];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clean(value, max) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

// Age on a given date; both dates are "YYYY-MM-DD"
function ageOn(birthdate, onDate) {
  const [by, bm, bd] = birthdate.split("-").map(Number);
  const [ey, em, ed] = onDate.split("-").map(Number);
  let age = ey - by;
  if (em < bm || (em === bm && ed < bd)) age--;
  return age;
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Hidden "honeypot" field: real people never fill it, bots often do
  if (data.website) return json({ ok: true });

  const competition = clean(data.competition, 20);
  const full_name = clean(data.full_name, 100);
  const contact_number = clean(data.contact_number, 30);
  const address = clean(data.address, 200);
  const barangay = clean(data.barangay, 40);
  const gender = clean(data.gender, 30);
  const birthdate = clean(data.birthdate, 10);

  if (!COMPETITIONS.includes(competition)) {
    return json({ error: "Unknown competition." }, 400);
  }
  if (!full_name || !contact_number || !address || !gender || !birthdate) {
    return json({ error: "Please fill in all fields." }, 400);
  }
  if (!GENDERS.includes(gender)) {
    return json({ error: "Please choose a gender option." }, 400);
  }
  if (RESIDENT_ONLY.includes(competition) && !BARANGAYS.includes(barangay)) {
    return json(
      { error: "Please choose your barangay. This competition is open to residents of Magdiwang only." },
      400
    );
  }
  if (!/^[0-9+()\-\s]{7,20}$/.test(contact_number)) {
    return json({ error: "Please enter a valid contact number." }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate) || Number.isNaN(Date.parse(birthdate))) {
    return json({ error: "Please enter a valid birthdate." }, 400);
  }
  const today = new Date().toISOString().slice(0, 10);
  if (birthdate > today || birthdate < "1900-01-01") {
    return json({ error: "Please enter a valid birthdate." }, 400);
  }

  // Singing contest: 15 and above as of the event date
  if (competition === "singing") {
    const age = ageOn(birthdate, env.EVENT_DATE);
    if (age < MIN_SINGING_AGE) {
      return json(
        { error: `The singing contest is open to ages ${MIN_SINGING_AGE} and above (as of the event date).` },
        400
      );
    }
  }

  const year = Number(env.EVENT_YEAR);

  // Block accidental double registrations (same name + contact, same competition and year)
  const existing = await env.DB.prepare(
    `SELECT id FROM registrations
     WHERE competition = ? AND year = ?
       AND lower(full_name) = lower(?) AND contact_number = ?`
  ).bind(competition, year, full_name, contact_number).first();

  if (existing) {
    return json({ error: "You are already registered for this competition." }, 409);
  }

  await env.DB.prepare(
    `INSERT INTO registrations
       (competition, full_name, contact_number, address, barangay, gender, birthdate, year)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    competition, full_name, contact_number, address,
    RESIDENT_ONLY.includes(competition) ? barangay : null,
    gender, birthdate, year
  ).run();

  return json({
    ok: true,
    competition,
    audition_url: competition === "singing" ? env.AUDITION_FORM_URL : null,
  });
}