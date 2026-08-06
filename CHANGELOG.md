# Changelog

Semua perubahan penting pada proyek ini dicatat di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan proyek ini mematuhi [Semantic Versioning](https://semver.org/lang/id/).

## [1.0.0] - 2026-08-06

### Added
- Migrasi total arsitektur: React 19 + TypeScript + Vite 7
- Backend API baru dengan **Hono di Cloudflare Workers**
- Database baru dengan **Cloudflare D1** (SQLite) — menggantikan Supabase
- Autentikasi admin aman: hash password **PBKDF2-SHA256** + sesi cookie `HttpOnly`
- **Rate limiting** per-IP pada endpoint publik dan login
- **Validasi input server-side** dengan Zod
- Redesign total antarmuka: palet hijau pinus & pasir, tipografi Fraunces + Plus Jakarta Sans
- Dashboard admin: statistik responden, skor rata-rata per pertanyaan, responden terbaru
- Screenshot dokumentasi di `docs/screenshots/`
- CI pipeline (lint, type-check, build) via GitHub Actions
- Template issue & pull request
- `AGENTS.md` — pedoman kerja AI coding assistant (anti-halusinasi)

### Changed
- Deployment dari Vercel → **Cloudflare Workers** (`survei-kepuasan-talun.mifdlaltsaqibalf25.workers.dev`)
- Konversi seluruh kode `.jsx` → `.tsx` (TypeScript)

### Removed
- Supabase (koneksi `@supabase/supabase-js` dan `src/lib/supabase.js`)
- Vercel (`vercel.json`)
- Autentikasi berbasis `localStorage` yang tidak aman
