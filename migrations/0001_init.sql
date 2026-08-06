-- 0001_init.sql
-- Skema awal database Survei Kepuasan Masyarakat Kelurahan Talun
-- Database: Cloudflare D1 (SQLite)

-- ============================================================
-- Tabel admins: akun petugas/pegawai yang mengelola dashboard
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,        -- format: pbkdf2$iterations$salt$hash (hex)
  nama_lengkap TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Tabel sessions: sesi login admin (cookie HttpOnly)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,    -- hash token sesi, bukan token mentah
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================
-- Tabel questions: daftar pertanyaan survei
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pertanyaan TEXT NOT NULL,
  status INTEGER NOT NULL DEFAULT 1,  -- 1 = aktif, 0 = nonaktif
  urutan INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- ============================================================
-- Tabel respondents: data diri responden
-- ============================================================
CREATE TABLE IF NOT EXISTS respondents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  usia INTEGER NOT NULL CHECK (usia BETWEEN 15 AND 120),
  jk TEXT NOT NULL CHECK (jk IN ('L', 'P')),
  pendidikan TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,
  kritik_saran TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_respondents_created_at ON respondents(created_at);

-- ============================================================
-- Tabel survey_answers: jawaban responden per pertanyaan
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  respondent_id INTEGER NOT NULL REFERENCES respondents(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  skor INTEGER NOT NULL CHECK (skor BETWEEN 1 AND 5),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_answers_respondent ON survey_answers(respondent_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON survey_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_skor ON survey_answers(skor);

-- ============================================================
-- Tabel rate_limits: pembatasan permintaan per IP (anti-spam)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  window_start TEXT NOT NULL,          -- awal jendela waktu (ISO 8601)
  request_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE (ip, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip, window_start);

-- ============================================================
-- Seed: admin awal (username: admin, password: ganti-sekarang)
-- Hash diisi saat inisialisasi pertama via skrip setup
-- ============================================================
-- Admin seed DIBUAT lewat skrip `npm run db:seed-admin` agar password
-- selalu di-hash dengan salt acak, bukan hardcoded di SQL.
