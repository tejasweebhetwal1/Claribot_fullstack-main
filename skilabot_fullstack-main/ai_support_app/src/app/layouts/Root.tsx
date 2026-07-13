import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
import {
  Bot,
  Briefcase,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { clearSession, getUser } from "../lib/api";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Home",
    icon: Home,
  },
  {
    to: "/faq",
    label: "FAQ",
    icon: HelpCircle,
  },
  {
    to: "/business",
    label: "Business",
    icon: Briefcase,
  },
];

export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const user = getUser();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    clearSession();
    setMobileMenuOpen(false);
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-purple-100 bg-purple-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {/* ClariBot logo */}
          <NavLink
            to="/"
            className="flex items-center gap-3"
            aria-label="Go to ClariBot home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
              <Bot size={21} />
            </span>

            <span className="text-xl font-black">
              Clari<span className="text-purple-600">Bot</span>
            </span>
          </NavLink>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 font-semibold transition",
                    isActive
                      ? "text-purple-700"
                      : "text-slate-700 hover:text-purple-700",
                  ].join(" ")
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* No user profile is displayed here */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 md:flex"
              >
                <LogOut size={17} />
                Logout
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-200 text-purple-700 md:hidden"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-purple-100 bg-white px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-4 py-3 font-semibold",
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}

              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}