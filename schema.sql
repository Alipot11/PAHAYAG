CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competition TEXT NOT NULL,          -- 'lantern' or 'singing'
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  address TEXT NOT NULL,
  barangay TEXT,                      -- Magdiwang barangay (lantern entries)
  gender TEXT NOT NULL,
  birthdate TEXT NOT NULL,            -- YYYY-MM-DD
  year INTEGER NOT NULL,              -- event year, e.g. 2026
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reg_comp_year
  ON registrations (competition, year);