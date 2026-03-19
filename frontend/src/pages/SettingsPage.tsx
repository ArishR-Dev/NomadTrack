import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const { isDark, toggle } = useTheme();

  return (
    <div className="page-container">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Configure your NomadTrack experience</p>
      </div>

      <div className="glass-card p-6 space-y-6 max-w-lg animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Toggle dark/light appearance</p>
          </div>
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg transition-colors duration-200 hover:bg-secondary"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Measurement Units</p>
              <p className="text-xs text-muted-foreground">Temperature and currency display</p>
            </div>
            <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg">
              <option>Metric (°C, USD)</option>
              <option>Imperial (°F, USD)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">Email alerts for new cities</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg transition-colors duration-200 hover:bg-secondary">
              Enabled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
