import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/questionario", label: "Questionario" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
];

function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath =
    user && user.role === "admin" ? "/admin" :
    user && user.role === "terapeuta" ? "/terapeuta" :
    user && user.role === "paziente" ? "/paziente" : null;

  return (
    <header data-testid="public-header" className="sticky top-0 z-40 bg-[#111111]/70 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" data-testid="public-logo" className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="FunzionaBene" className="w-11 h-11 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-xl text-[#F4F1ED] tracking-tight">funzionabene</span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B8FA3]">clinica psicologica</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors ${isActive ? "text-[#D4A017]" : "text-[#E6E2D8]/80 hover:text-[#F4F1ED]"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {user && user.role ? (
            <>
              <button
                data-testid="nav-dashboard"
                onClick={() => navigate(dashboardPath)}
                className="text-sm text-[#E6E2D8]/80 hover:text-[#F4F1ED]"
              >
                Area personale
              </button>
              <button
                data-testid="nav-logout"
                onClick={async () => { await logout(); navigate("/"); }}
                className="text-sm text-[#E6E2D8]/60 hover:text-[#F4F1ED]"
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login" className="text-sm text-[#E6E2D8]/80 hover:text-[#F4F1ED]">
                Accedi
              </Link>
              <Link
                to="/questionario"
                data-testid="nav-cta"
                className="px-5 py-2.5 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full text-sm tracking-wide transition-all"
              >
                Inizia il Questionario
              </Link>
            </>
          )}
        </div>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen(!open)}
          className="lg:hidden text-[#F4F1ED] p-2"
          aria-label="Apri menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-[#111111]/95 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-3">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `block py-2 text-base ${isActive ? "text-[#D4A017]" : "text-[#E6E2D8]/80"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-3">
              {user && user.role ? (
                <>
                  <button onClick={() => { setOpen(false); navigate(dashboardPath); }} className="text-left text-[#E6E2D8]/80 py-2">
                    Area personale
                  </button>
                  <button onClick={async () => { await logout(); setOpen(false); navigate("/"); }} className="text-left text-[#E6E2D8]/60 py-2">
                    Esci
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-[#E6E2D8]/80 py-2">Accedi</Link>
                  <Link
                    to="/questionario"
                    onClick={() => setOpen(false)}
                    className="inline-block w-full text-center px-5 py-3 bg-[#D4A017] text-[#111111] font-medium rounded-full"
                  >
                    Inizia il Questionario
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer data-testid="public-footer" className="bg-[#0A0A0A] border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/logo.png" alt="FunzionaBene" className="w-11 h-11 object-contain" />
            <span className="font-serif text-2xl text-[#F4F1ED]">funzionabene</span>
          </div>
          <p className="text-[#E6E2D8]/60 text-sm max-w-md leading-relaxed">
            Uno spazio discreto, professionale e caloroso per la tua salute psicologica e sessuologica.
            Specialisti iscritti all'Albo, percorsi individuali e di coppia.
          </p>
        </div>
        <div>
          <h4 className="text-[#F4F1ED] text-sm tracking-[0.15em] uppercase mb-4">Esplora</h4>
          <ul className="space-y-2 text-sm text-[#E6E2D8]/60">
            <li><Link to="/questionario" className="hover:text-[#D4A017]">Questionario</Link></li>
            <li><Link to="/blog" className="hover:text-[#D4A017]">Blog</Link></li>
            <li><Link to="/faq" className="hover:text-[#D4A017]">FAQ</Link></li>
            <li><Link to="/login" className="hover:text-[#D4A017]">Accedi</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[#F4F1ED] text-sm tracking-[0.15em] uppercase mb-4">Legale</h4>
          <ul className="space-y-2 text-sm text-[#E6E2D8]/60">
            <li><span className="cursor-pointer hover:text-[#D4A017]">Privacy Policy</span></li>
            <li><span className="cursor-pointer hover:text-[#D4A017]">Cookie Policy</span></li>
            <li><span className="cursor-pointer hover:text-[#D4A017]">GDPR</span></li>
            <li><span className="cursor-pointer hover:text-[#D4A017]">Termini</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#E6E2D8]/40">
          <span>© {new Date().getFullYear()} funzionabene.it — Tutti i diritti riservati</span>
          <span>P.IVA 00000000000 · Iscritta all'Ordine degli Psicologi</span>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#111111] text-[#F4F1ED] font-sans antialiased">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
