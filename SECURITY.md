# Kebijakan Keamanan

## Laporan Kerentanan

Kami menganggap serius keamanan aplikasi ini karena digunakan untuk pelayanan publik. **Jangan laporkan kerentanan melalui Issues publik.**

Kirim laporan melalui **GitHub Private Vulnerability Reporting** pada halaman *Security* repositori ini, atau hubungi pemilik repositori secara langsung.

### Informasi yang perlu disertakan

- Deskripsi kerentanan dan dampak potensial
- Langkah reproduksi (minimal)
- Versi/branch yang terdampak
- Data apa pun yang mungkin terpapar

### Komitmen kami

- **Konfirmasi penerimaan** dalam 3 hari kerja
- **Penilaian & tanggapan awal** dalam 14 hari kerja
- **Perbaikan** segera setelah verifikasi; publikasi detail setelah patch dirilis

## Lingkup

Dalam lingkup:

- Autentikasi dan otorisasi dashboard admin
- Keamanan akses data Supabase (Row Level Security)
- Kerahasiaan data responden (nama, usia, pendidikan, pekerjaan, kritik/saran)
- Eksposur secret/kredensial di kode atau riwayat git
- Serangan berbasis web (XSS, CSRF, injeksi)

Di luar lingkup (bukan aplikasi ini):

- Kerentanan pada infrastruktur Vercel atau Supabase itu sendiri
- Perangkat/perilaku pengguna akhir

## Praktik Aman

- Kredensial hanya disimpan di variabel lingkungan (`.env`), dan `.env` di-ignore oleh git.
- Jangan pernah mempublikasikan kunci `service_role` Supabase.
- Data responden adalah data pribadi; gunakan prinsip akses minimum.
