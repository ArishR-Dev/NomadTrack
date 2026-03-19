import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Globe, Map, GitCompare, TrendingUp, Heart, Settings, Info, Compass, X, Menu
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Explore Cities", path: "/explore", icon: Compass },
  { title: "Global Map", path: "/map", icon: Map },
  { title: "Comparison", path: "/compare", icon: GitCompare },
  { title: "Insights", path: "/insights", icon: TrendingUp },
  { title: "Favorites", path: "/favorites", icon: Heart },
  { title: "Settings", path: "/settings", icon: Settings },
  { title: "About", path: "/about", icon: Info },
];

export function AppSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar border border-sidebar-border lg:hidden"
      >
        <Menu className="w-5 h-5 text-sidebar-foreground" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Globe className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-display font-bold text-sidebar-foreground">NomadTrack</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-sidebar-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group/nav ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary transition-all duration-300" />
                )}
                <item.icon className={`w-4.5 h-4.5 transition-transform duration-200 ${active ? "scale-110" : "group-hover/nav:scale-105"}`} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
              N
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Nomad User</p>
              <p className="text-xs text-sidebar-muted truncate">nomad@track.io</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
