import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import CookieConsentBanner from "@/components/public/CookieConsentBanner";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/sedute-immersive", label: "Immersive" },
  { to: "/aree-intervento", label: "Aree" },
  { to: "/chi-siamo", label: "Chi siamo" },
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
    <header data-testid="public-header" className="sticky top-0 z-40 bg-[#E5D9C5]/70 backdrop-blur-xl border-b border-[rgba(28,28,28,0.05)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" data-testid="public-logo" className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="FunzionaBene" className="w-12 h-12 object-contain" />
          <span className="font-serif text-3xl sm:text-4xl text-[#1C1C1C] tracking-tight leading-none">funzionabene</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors ${isActive ? "text-[#D4A017]" : "text-[rgba(28,28,28,0.7)] hover:text-[#1C1C1C]"}`
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
                className="text-sm text-[rgba(28,28,28,0.7)] hover:text-[#1C1C1C]"
              >
                Area personale
              </button>
              <button
                data-testid="nav-logout"
                onClick={async () => { await logout(); navigate("/"); }}
                className="text-sm text-[rgba(28,28,28,0.6)] hover:text-[#1C1C1C]"
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login" className="text-sm text-[rgba(28,28,28,0.7)] hover:text-[#1C1C1C]">
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
          className="lg:hidden text-[#1C1C1C] p-2"
          aria-label="Apri menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[rgba(28,28,28,0.05)] bg-[#E5D9C5]/95 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-3">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `block py-2 text-base ${isActive ? "text-[#D4A017]" : "text-[rgba(28,28,28,0.7)]"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-[rgba(28,28,28,0.05)] flex flex-col gap-3">
              {user && user.role ? (
                <>
                  <button onClick={() => { setOpen(false); navigate(dashboardPath); }} className="text-left text-[rgba(28,28,28,0.7)] py-2">
                    Area personale
                  </button>
                  <button onClick={async () => { await logout(); setOpen(false); navigate("/"); }} className="text-left text-[rgba(28,28,28,0.6)] py-2">
                    Esci
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-[rgba(28,28,28,0.7)] py-2">Accedi</Link>
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
    <footer data-testid="public-footer" className="bg-[#D9CBB3] border-t border-[rgba(28,28,28,0.05)] mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/logo.png" alt="FunzionaBene" className="w-11 h-11 object-contain" />
            <span className="font-serif text-2xl text-[#1C1C1C]">funzionabene</span>
          </div>
          <p className="text-[rgba(28,28,28,0.6)] text-sm max-w-md leading-relaxed">
            Uno spazio discreto, professionale e caloroso per la tua salute psicologica e sessuologica.
            Specialisti iscritti all'Albo, percorsi individuali e di coppia.
          </p>
        </div>
        <div>
          <h4 className="text-[#1C1C1C] text-sm tracking-[0.15em] uppercase mb-4">Esplora</h4>
          <ul className="space-y-2 text-sm text-[rgba(28,28,28,0.6)]">
            <li><Link to="/questionario" className="hover:text-[#D4A017]">Questionario</Link></li>
            <li><Link to="/sedute-immersive" className="hover:text-[#D4A017]">Sedute immersive</Link></li>
            <li><Link to="/aree-intervento" className="hover:text-[#D4A017]">Aree di intervento</Link></li>
            <li><Link to="/chi-siamo" className="hover:text-[#D4A017]">Chi siamo</Link></li>
            <li><Link to="/blog" className="hover:text-[#D4A017]">Blog</Link></li>
            <li><Link to="/faq" className="hover:text-[#D4A017]">FAQ</Link></li>
            <li><Link to="/emergenze" className="hover:text-[#C77474]">Numeri d'emergenza</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[#1C1C1C] text-sm tracking-[0.15em] uppercase mb-4">Legale</h4>
          <ul className="space-y-2 text-sm text-[rgba(28,28,28,0.6)]">
            <li><Link to="/privacy" className="hover:text-[#D4A017]">Privacy Policy</Link></li>
            <li><Link to="/cookie" className="hover:text-[#D4A017]">Cookie Policy</Link></li>
            <li><Link to="/termini" className="hover:text-[#D4A017]">Termini e Condizioni</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[rgba(28,28,28,0.05)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[rgba(28,28,28,0.4)]">
          <span>© {new Date().getFullYear()} funzionabene.it — Tutti i diritti riservati</span>
          <span>P.IVA 00000000000 · Iscritta all'Ordine degli Psicologi</span>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#E5D9C5] text-[#1C1C1C] font-sans antialiased">
      <Header />
      <Outlet />
      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
