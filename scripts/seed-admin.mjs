/**
 * Seed admin pertama. Menghasilkan hash PBKDF2 lalu insert ke D1.
 * Penggunaan:
 *   npm run db:seed-admin -- admin@kelurahan "passwordku" "Nama Admin"
 * Wajib: password minimal 8 karakter. Hash dihasilkan acak per eksekusi.
 *
 * SQL ditulis ke file temp lalu dieksekusi via --file agar karakter $
 * pada hash tidak di-expand oleh shell.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [username, password, namaLengkap] = process.argv.slice(2);

if (!username || !password || !namaLengkap) {
  console.error("Usage: npm run db:seed-admin -- <username> <password> <nama_lengkap>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password minimal 8 karakter.");
  process.exit(1);
}

const encoder = new TextEncoder();
const ITERATIONS = 100_000;
const SALT_LENGTH = 16;

function toHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    keyMaterial,
    256,
  );
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(new Uint8Array(bits))}`;
}

const hash = await hashPassword(password);
const sql = `INSERT INTO admins (username, password_hash, nama_lengkap) VALUES ('${username.replace(/'/g, "''")}', '${hash}', '${namaLengkap.replace(/'/g, "''")}');`;

const tmpFile = join(tmpdir(), `skm-seed-${Date.now()}.sql`);
writeFileSync(tmpFile, sql, "utf8");

try {
  const result = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", "survei-kepuasan-talun-db", "--remote", "--file", tmpFile],
    { encoding: "utf8", stdio: "inherit" },
  );
  if (result.status !== 0) {
    console.error("Gagal membuat admin.");
    process.exit(1);
  }
  console.log(`\nAdmin '${username}' berhasil dibuat.`);
} finally {
  unlinkSync(tmpFile);
}
