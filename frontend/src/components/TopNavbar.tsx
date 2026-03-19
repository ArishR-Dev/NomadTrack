import { Moon, Sun, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface TopNavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function TopNavbar({ isDark, onToggleTheme }: TopNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/signin");
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "N";

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between gap-4 px-6 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">N</span>
        </div>
        <span className="text-base font-display font-bold text-foreground hidden sm:inline">NomadTrack</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg transition-colors duration-200 hover:bg-secondary text-muted-foreground"
        >
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {isAuthenticated ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground ml-1 hover:opacity-90 transition-opacity"
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 w-48 rounded-lg border border-border bg-card/95 backdrop-blur-xl shadow-[var(--shadow-floating)] py-1 animate-scale-in origin-top-right z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </Link>
                <div className="h-px bg-border mx-2 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/signin"
            className="px-3 py-1.5 text-sm font-medium rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity ml-1"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
