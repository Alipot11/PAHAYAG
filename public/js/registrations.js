const BARANGAYS = [
  "Agsao", "Agutay", "Ambulong", "Dulangan", "Ipil",
  "Jao-asan", "Poblacion", "Silum", "Tampayan",
];
const LABELS = { lantern: "Lantern Making", singing: "Singing Contest" };

const fComp = document.getElementById("f-competition");
const fBrgy = document.getElementById("f-barangay");
const fYear = document.getElementById("f-year");
const fSearch = document.getElementById("f-search");
const rowsEl = document.getElementById("rows");
const summaryEl = document.getElementById("summary");
const showingEl = document.getElementById("showing");
const exportEl = document.getElementById("export");
const msg = document.getElementById("msg");

for (const b of BARANGAYS) fBrgy.append(new Option(b, b));

async function api(path, options = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  if (res.status === 401) {
    location.href = "/admin/login";
    throw new Error("Not logged in");
  }
  return res;
}

function cell(text) {
  const td = document.createElement("td");
  td.textContent = text ?? "";
  return td;
}

function fullAddress(r) {
  return r.barangay
    ? `${r.address}, ${r.barangay}, Magdiwang, Romblon`
    : r.address;
}

function formatDate(utc) {
  return new Date(utc.replace(" ", "T") + "Z").toLocaleString("en-PH", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila",
  });
}

function filterParams(includeSearch) {
  const params = new URLSearchParams();
  if (fComp.value) params.set("competition", fComp.value);
  if (fBrgy.value) params.set("barangay", fBrgy.value);
  if (fYear.value) params.set("year", fYear.value);
  if (includeSearch && fSearch.value.trim()) params.set("q", fSearch.value.trim());
  return params;
}

async function load() {
  msg.hidden = true;
  const res = await api("/api/admin/registrations?" + filterParams(true));
  const data = await res.json();

  // Year dropdown (filled once)
  if (fYear.options.length === 0) {
    const years = data.years.includes(data.year) ? data.years : [data.year, ...data.years];
    for (const y of years) fYear.append(new Option(y, y));
    fYear.value = data.year;
  }

  // Summary cards for the selected year
  summaryEl.innerHTML = "";
  let total = 0;
  for (const c of data.counts) total += c.n;
  const cards = [["Total", total], ...data.counts.map((c) => [LABELS[c.competition] || c.competition, c.n])];
  for (const [label, n] of cards) {
    const d = document.createElement("div");
    d.className = "fact";
    const b = document.createElement("b");
    b.textContent = label;
    const s = document.createElement("span");
    s.textContent = n;
    d.append(b, s);
    summaryEl.append(d);
  }

  showingEl.textContent = `Showing ${data.rows.length} ${data.rows.length === 1 ? "entry" : "entries"}. `;
  exportEl.href = "/api/admin/export?" + filterParams(false);

  rowsEl.innerHTML = "";
  if (data.rows.length === 0) {
    rowsEl.innerHTML = '<tr><td colspan="10">No registrations found.</td></tr>';
    return;
  }

  for (const r of data.rows) {
    const tr = document.createElement("tr");
    tr.append(
      cell(r.id),
      cell(LABELS[r.competition] || r.competition),
      cell(r.full_name),
      cell(r.contact_number),
      cell(fullAddress(r)),
      cell(r.gender),
      cell(r.birthdate),
      cell(r.age ?? "–"),
      cell(formatDate(r.created_at))
    );

    const td = document.createElement("td");
    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn btn--outline-dark btn--small";
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      if (!confirm(`Delete the registration of ${r.full_name}? This cannot be undone.`)) return;
      const res = await api(`/api/admin/registrations?id=${r.id}`, { method: "DELETE" });
      if (!res.ok) {
        msg.className = "msg msg--error";
        msg.textContent = "Could not delete that entry.";
        msg.hidden = false;
        return;
      }
      load();
    });
    td.append(del);
    tr.append(td);
    rowsEl.append(tr);
  }
}

// Reload when a filter changes; wait a moment while typing in the search box
let timer;
for (const el of [fComp, fBrgy, fYear]) el.addEventListener("change", load);
fSearch.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
});

load().catch(() => {});