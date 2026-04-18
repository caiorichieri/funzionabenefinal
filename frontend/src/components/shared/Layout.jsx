import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/shared/Sidebar";
import { Bell, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = `${user?.nome?.[0] || ""}${user?.cognome?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 h-screen z-30 lg:z-auto
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-[#FDFBF7] border-b border-[rgba(28,28,28,0.1)] px-6 py-4 flex items-center justify-between">
          <button
            data-testid="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-[rgba(28,28,28,0.05)]"
          >
            <Menu className="w-5 h-5 text-[#1C1C1C]" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-[rgba(28,28,28,0.05)] relative">
              <Bell className="w-5 h-5 text-[rgba(28,28,28,0.6)]" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-[rgba(28,28,28,0.1)]">
              <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{initials}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-[#1C1C1C]">{user?.nome} {user?.cognome}</div>
                <div className="text-xs text-[rgba(28,28,28,0.5)] capitalize">{user?.role}</div>
              </div>
              <button
                data-testid="logout-btn"
                onClick={handleLogout}
                className="ml-2 p-2 rounded-xl hover:bg-red-50 text-[rgba(28,28,28,0.5)] hover:text-red-600 transition-colors"
                title="Esci"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
