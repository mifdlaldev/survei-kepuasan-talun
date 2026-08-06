import { applyD1Migrations, env } from "cloudflare:test";

// Terapkan skema migration ke database test sebelum test dijalankan.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
