import { useEffect, useMemo, useState } from "react";
import { ControlPanelLayout } from "@/pages/control/ControlPanelLayout";
import { fetchConsoleAnalytics, type ControlConsoleAnalytics } from "@/lib/api";
import { StatSkeleton } from "@/components/LoaderSkeleton";
import { Users, Globe, Heart, TrendingUp } from "lucide-react";
import { ChartContainer, CustomTooltip } from "@/components/ChartContainer";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { toast } from "sonner";

const COLORS = ["hsl(173,58%,39%)", "hsl(217,91%,60%)", "hsl(262,52%,55%)", "hsl(25,95%,53%)"];

export default function ControlPanelDashboard() {
  const [analytics, setAnalytics] = useState<ControlConsoleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsoleAnalytics()
      .then(setAnalytics)
      .catch(() => toast.error("Console data unavailable"))
      .finally(() => setLoading(false));
  }, []);

  const pieData = useMemo(
    () =>
      analytics
        ? [
            { name: "Users", value: analytics.totalUsers },
            { name: "Cities", value: analytics.totalCities },
            { name: "Favorites", value: analytics.totalFavorites },
          ]
        : [],
    [analytics]
  );

  const uptimeText = useMemo(() => {
    if (!analytics) return "";
    const s = analytics.uptimeSeconds ?? 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m || !parts.length) parts.push(`${m}m`);
    return parts.join(" ");
  }, [analytics]);

  return (
    <ControlPanelLayout title="Platform Console" subtitle="Internal system dashboard and operational overview">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card group cursor-default transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
                  <p className="text-2xl font-display font-bold group-hover:text-primary">{analytics?.totalUsers ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary text-primary">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="stat-card group cursor-default transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Cities</p>
                  <p className="text-2xl font-display font-bold group-hover:text-primary">{analytics?.totalCities ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Catalog size</p>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary text-chart-purple">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="stat-card group cursor-default transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Favorites</p>
                  <p className="text-2xl font-display font-bold group-hover:text-primary">{analytics?.totalFavorites ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Saved items</p>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary text-chart-orange">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="stat-card group cursor-default transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Most Favorited</p>
                  <p className="text-2xl font-display font-bold group-hover:text-primary truncate">{analytics?.mostFavoritedCity ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Highest saves</p>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary text-chart-blue">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <ChartContainer title="System Composition" subtitle="Users vs Cities vs Favorites" index={0}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={105} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer
              title="System Health"
              subtitle={
                loading
                  ? "Checking status..."
                  : `API: ${analytics?.apiStatus ?? "unknown"} · DB: ${analytics?.dbStatus ?? "unknown"} · Uptime: ${uptimeText}`
              }
              index={1}
            >
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This console is intentionally not linked from the main UI. Access requires a valid JWT where the payload
                  role is <span className="text-foreground font-medium">admin</span>.
                </p>
                <div className="glass-card p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Shortcut</div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Open console</span>
                    <kbd className="px-2 py-1 rounded bg-secondary border border-border text-foreground">Ctrl + Shift + A</kbd>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hidden route</div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Console URL</span>
                    <code className="text-xs px-2 py-1 rounded bg-secondary border border-border">/control-panel</code>
                  </div>
                </div>
              </div>
            </ChartContainer>
          </div>
        </>
      )}
    </ControlPanelLayout>
  );
}

