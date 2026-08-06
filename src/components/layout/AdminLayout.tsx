import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileQuestion, MessageSquare, LogOut, Menu } from "lucide-react";
import { clsx } from "clsx";
import { api } from "@/lib/api";
import type { AdminSession } from "@/lib/types";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/questions", label: "Kelola Soal", icon: FileQuestion },
  { path: "/admin/feedback", label: "Kritik & Saran", icon: MessageSquare },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getMe()
      .then(({ admin }) => setAdmin(admin))
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-sand-100">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-pine-800 text-pine-100 transition-transform duration-300 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-pine-700/60 px-6">
          <img
            src="/logoinsunmedal.png"
            alt="Logo"
            className="h-10 w-10 rounded-lg bg-white/10 object-contain p-1"
          />
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-white">
              Admin Panel
            </p>
            <p className="text-xs text-pine-300">Kelurahan Talun</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-pine-700 text-white"
                    : "text-pine-200 hover:bg-pine-700/50 hover:text-white",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-pine-700/60 p-4">
          <button
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-pine-200 transition-colors hover:bg-red-900/40 hover:text-red-100"
          >
            <LogOut className="h-5 w-5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-sand-200 bg-white px-4 sm:px-8">
          <button
            className="rounded-lg p-2 text-charcoal-700 hover:bg-sand-100 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-charcoal-900">
                {admin?.nama_lengkap ?? "…"}
              </p>
              <p className="text-xs text-charcoal-700/60">Administrator</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-700 text-sm font-bold text-white">
              {(admin?.nama_lengkap ?? "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
