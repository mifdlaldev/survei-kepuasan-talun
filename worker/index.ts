import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./src/types";
import { publicRoutes } from "./src/routes/public";
import { adminRoutes } from "./src/routes/admin";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors());

app.get("/api/health", (c) => c.json({ status: "ok", time: new Date().toISOString() }));

app.route("/api", publicRoutes);
app.route("/api/admin", adminRoutes);

// API: 404 JSON. Selain itu: SPA fallback → index.html dari assets.
app.notFound(async (c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Endpoint tidak ditemukan" }, 404);
  }
  const indexUrl = new URL("/index.html", c.req.url);
  const res = await c.env.ASSETS.fetch(indexUrl.toString());
  return new Response(res.body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    { error: "Terjadi kesalahan internal", detail: err instanceof Error ? err.message : String(err) },
    500,
  );
});

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
