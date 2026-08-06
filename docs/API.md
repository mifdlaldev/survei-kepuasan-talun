# Dokumentasi API

Semua endpoint API di bawah path `/api`. Base URL produksi:

```
https://survei-kepuasan-talun.mifdlaltsaqibalf25.workers.dev
```

Format respons error selalu:

```json
{ "error": "pesan kesalahan" }
```

## Autentikasi

Endpoint admin memakai **cookie sesi** (`skm_session`, `HttpOnly`). Login mengembalikan cookie; klien browser mengirimnya otomatis. Tidak ada token di body/header manual.

## Endpoint Publik

### `GET /api/questions`
Daftar pertanyaan aktif untuk form survei.

**Respons 200:**
```json
{
  "data": [
    { "id": 1, "pertanyaan": "Bagaimana kepuasan Anda…", "urutan": 0 }
  ]
}
```

### `POST /api/survey`
Mengirim survei (responden + jawaban). **Rate limit: 10 request/menit/IP.**

**Body:**
```json
{
  "respondent": {
    "nama": "Budi Santoso",
    "usia": 34,
    "jk": "L",
    "pendidikan": "Sarjana (S1)",
    "pekerjaan": "Wiraswasta",
    "kritik_saran": "opsional"
  },
  "answers": [
    { "question_id": 1, "skor": 5 }
  ]
}
```

**Respons 201:** `{ "success": true, "respondent_id": 1 }`
**Error:** 422 (validasi), 429 (rate limit)

## Endpoint Admin (butuh sesi)

### `POST /api/admin/login`
**Body:** `{ "username": "...", "password": "..." }`
**Respons 200:** `{ "success": true, "admin": { "id", "username", "nama_lengkap" } }` + Set-Cookie.

### `POST /api/admin/logout`
Menghapus sesi + cookie.

### `GET /api/admin/me`
Info admin saat ini. **401** tanpa sesi.

### `GET /api/admin/dashboard`
Statistik: total responden, total jawaban, skor rata-rata, skor per pertanyaan, responden terbaru.

### `GET /api/admin/questions`
Semua soal (aktif + nonaktif) dengan `status`, `urutan`, `created_at`.

### `POST /api/admin/questions`
**Body:** `{ "pertanyaan": "...", "status": 0|1, "urutan": 0 }` → **201**

### `PATCH /api/admin/questions/:id`
Update parsial: `{ "pertanyaan"?, "status"?, "urutan"? }`

### `DELETE /api/admin/questions/:id`
Hapus soal. **404** jika tidak ada.

### `GET /api/admin/feedback`
Kritik & saran responden (non-kosong), terbaru dulu, maks 200.

### `POST /api/admin/admins`
Membuat akun admin baru.
**Body:** `{ "username": "...", "password": "...", "nama_lengkap": "..." }`

## Kode Status

| Kode | Makna |
|------|-------|
| 200 | OK |
| 201 | Dibuat |
| 400 | Format permintaan tidak valid |
| 401 | Tidak terautentikasi / sesi tidak valid |
| 403 | Terlarang (akun nonaktif) |
| 404 | Tidak ditemukan |
| 409 | Konflik (username dipakai) |
| 422 | Validasi gagal |
| 429 | Rate limit tercapai |

## Keamanan

- Validasi input server-side dengan [Zod](https://zod.dev) di semua body.
- SQL berparameter — tahan injeksi.
- Rate limiting per-IP di D1 untuk endpoint publik + login.
- Password di-hash PBKDF2-SHA256 (salt acak, 100.000 iterasi).
