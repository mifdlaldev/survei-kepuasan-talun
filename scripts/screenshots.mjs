/**
 * Screenshot halaman utama untuk README.
 * Menghasilkan file di docs/screenshots/.
 * Jalankan: node scripts/screenshots.mjs
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = "https://survei-kepuasan-talun.mifdlaltsaqibalf25.workers.dev";
const OUT = new URL("../docs/screenshots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const EXECUTABLE = process.env.CHROME_PATH ||
  "/home/bismillah/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";

const VIEWPORT = { width: 1280, height: 800 };

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  headless: true,
});

const page = await browser.newPage({ viewport: VIEWPORT });

async function shot(name, url, { login = false } = {}) {
  if (login) {
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.fill('input[placeholder*="username"]', "admin-talun");
    await page.fill('input[placeholder*="••••"]', "Kelurahan123!");
    await Promise.all([
      page.waitForURL("**/admin/dashboard"),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForTimeout(1200);
  } else {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: false });
  console.log(`✓ ${name}.png`);
}

// Halaman publik: intro
await shot("01-survei-intro", `${BASE}/`);

// Halaman publik: form biodata
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.click("text=Mulai Isi Survei");
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}02-survei-biodata.png` });
console.log("✓ 02-survei-biodata.png");

// Halaman publik: pertanyaan survei (isi biodata dulu)
await page.fill('input[placeholder*="Budi Santoso"]', "Budi Santoso");
await page.fill('input[placeholder*="34"]', "34");
await page.selectOption("select", { label: "Laki-laki" });
await page.selectOption("select >> nth=1", { label: "Sarjana (S1)" });
await page.fill('input[placeholder*="Wiraswasta"]', "Wiraswasta");
await page.click("text=Lanjut ke Pertanyaan");
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}03-survei-pertanyaan.png` });
console.log("✓ 03-survei-pertanyaan.png");

// Login + dashboard admin
await shot("04-admin-dashboard", `${BASE}/login`, { login: true });

// Kelola soal
await page.click("text=Kelola Soal");
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}05-admin-soal.png` });
console.log("✓ 05-admin-soal.png");

// Kritik & saran
await page.click("text=Kritik & Saran");
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}06-admin-feedback.png` });
console.log("✓ 06-admin-feedback.png");

await browser.close();
console.log("\nSelesai. Screenshot di docs/screenshots/");
