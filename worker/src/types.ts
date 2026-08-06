/** Env bindings dari wrangler.toml */

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /** Secret untuk menandai sesi antar-restart (opsional, direkomendasikan). */
  SESSION_SECRET?: string;
}

/** Admin yang sedang login (dari middleware auth). */
export interface AdminContext {
  admin: {
    id: number;
    username: string;
    nama_lengkap: string;
  };
}

export type AppEnv = {
  Bindings: Env;
  Variables: {
    admin: AdminContext["admin"];
  };
};
