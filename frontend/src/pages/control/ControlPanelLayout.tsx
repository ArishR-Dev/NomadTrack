import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Building2, Users } from "lucide-react";

export function ControlPanelLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="page-container pb-24">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="section-title">{title}</h1>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <NavLink
          to="/control-panel/dashboard"
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isActive ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary/40 border-border text-foreground hover:bg-secondary"
            }`
          }
        >
          <span className="inline-flex items-center gap-2"><BarChart3 className="w-4 h-4" /> System Dashboard</span>
        </NavLink>
        <NavLink
          to="/control-panel/analytics"
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isActive ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary/40 border-border text-foreground hover:bg-secondary"
            }`
          }
        >
          <span className="inline-flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Analytics</span>
        </NavLink>
        <NavLink
          to="/control-panel/cities"
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isActive ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary/40 border-border text-foreground hover:bg-secondary"
            }`
          }
        >
          <span className="inline-flex items-center gap-2"><Building2 className="w-4 h-4" /> Cities</span>
        </NavLink>
        <NavLink
          to="/control-panel/users"
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isActive ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary/40 border-border text-foreground hover:bg-secondary"
            }`
          }
        >
          <span className="inline-flex items-center gap-2"><Users className="w-4 h-4" /> Users</span>
        </NavLink>
      </div>

      {children}
    </div>
  );
}

