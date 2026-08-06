import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { BatikPattern } from "@/components/BatikPattern";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await api.login(username, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <BatikPattern />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/logoinsunmedal.png"
            alt="Logo Kelurahan Talun"
            className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-white p-1.5 shadow-card"
          />
          <h1 className="font-display text-2xl font-bold text-charcoal-900">
            Panel Administrator
          </h1>
          <p className="mt-1 text-sm text-charcoal-700/70">
            Kelurahan Talun — Survei Kepuasan Masyarakat
          </p>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-lift">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <TextField
              label="Username"
              required
              autoComplete="username"
              placeholder="Masukkan username…"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memeriksa…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Masuk Dashboard
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
