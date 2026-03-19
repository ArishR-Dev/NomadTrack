import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCities, fetchTopCities, fetchCheapestCities, fetchFastestInternetCities, fetchAnalytics, type Analytics } from "@/lib/api";
import { City } from "@/types/city";
import { StatCard } from "@/components/StatCard";
import { ChartContainer, CustomTooltip, chartGridColor, chartTickStyle } from "@/components/ChartContainer";
import { StatSkeleton } from "@/components/LoaderSkeleton";
import { DollarSign, Wifi, Globe, Star, TrendingUp, Zap, BarChart3, Heart, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line
} from "recharts";

const PIE_COLORS = ["hsl(173,58%,39%)", "hsl(25,95%,53%)", "hsl(262,52%,55%)", "hsl(217,91%,60%)", "hsl(142,71%,45%)", "hsl(0,72%,51%)"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [topCities, setTopCities] = useState<City[]>([]);
  const [cheapest, setCheapest] = useState<City[]>([]);
  const [fastest, setFastest] = useState<City[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCities(),
      fetchTopCities(5),
      fetchCheapestCities(5),
      fetchFastestInternetCities(5),
      fetchAnalytics().catch(() => null),
    ]).then(([all, top, cheap, fast, stats]) => {
      setCities(all);
      setTopCities(top);
      setCheapest(cheap);
      setFastest(fast);
      setAnalytics(stats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const avgCost = Math.round(cities.reduce((s, c) => s + c.costIndex, 0) / cities.length);
  const avgSpeed = Math.round(cities.reduce((s, c) => s + c.internetSpeed, 0) / cities.length);
  const topCity = topCities[0];

  const costData = cities.slice(0, 10).map(c => ({ name: c.city, cost: c.costIndex }));
  const speedData = cities.slice(0, 10).map(c => ({ name: c.city, speed: c.internetSpeed }));

  const climateMap: Record<string, number> = {};
  cities.forEach(c => { climateMap[c.climate] = (climateMap[c.climate] || 0) + 1; });
  const climateData = Object.entries(climateMap).map(([name, value]) => ({ name, value }));

  const radarData = topCities.slice(0, 5).map(c => ({
    city: c.city,
    cost: 100 - c.costIndex,
    internet: c.internetSpeed,
    safety: c.safetyScore,
    nomad: c.nomadScore,
  }));

  return (
    <div className="page-container pb-24">
      <div>
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">Global overview of digital nomad cities</p>
      </div>

      {/* Live Analytics — platform insights (data aggregation) */}
      {analytics && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Live System Analytics
            </h2>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">Platform insights</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="glass-card p-4 group hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary text-chart-purple"><Globe className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Total Cities</p>
                  <p className="text-xl font-display font-bold">{analytics.totalCities}</p>
                  <p className="text-[10px] text-muted-foreground truncate">In database</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 group hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary text-primary"><BarChart3 className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Avg Nomad Score</p>
                  <p className="text-xl font-display font-bold">{Number(analytics.avgNomadScore)}<span className="text-xs text-muted-foreground font-normal">/100</span></p>
                  <p className="text-[10px] text-muted-foreground">Computed</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 group hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary text-chart-green"><DollarSign className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Cheapest City</p>
                  <p className="text-xl font-display font-bold truncate">{analytics.cheapestCity}</p>
                  <p className="text-[10px] text-muted-foreground truncate">Lowest cost index</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 group hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary text-chart-blue"><Wifi className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Fastest Internet</p>
                  <p className="text-xl font-display font-bold truncate">{analytics.fastestInternet}</p>
                  <p className="text-[10px] text-muted-foreground truncate">Highest Mbps</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 group hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary text-chart-orange"><Heart className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Most Favorited</p>
                  <p className="text-xl font-display font-bold truncate">{analytics.mostFavorited}</p>
                  <p className="text-[10px] text-muted-foreground">{analytics.mostFavoritedCount > 0 ? `${analytics.mostFavoritedCount} saves` : "No saves yet"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Cost Index" value={`$${avgCost}`} subtitle="Across all cities" icon={DollarSign} accentColor="text-chart-green" index={0} />
        <StatCard title="Avg Internet Speed" value={`${avgSpeed} Mbps`} subtitle="Global average" icon={Wifi} accentColor="text-chart-blue" index={1} />
        <StatCard title="Total Cities" value={cities.length} subtitle="Available to explore" icon={Globe} accentColor="text-chart-purple" index={2} />
        <StatCard title="Top Rated" value={topCity?.city || "—"} subtitle={`Score: ${topCity?.nomadScore}/100`} icon={Star} accentColor="text-chart-orange" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer title="Cost of Living Comparison" subtitle="Cost index by city" index={0}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="name" tick={chartTickStyle} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={chartTickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost" fill="hsl(173,58%,39%)" radius={[4, 4, 0, 0]} animationDuration={1200} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Internet Speed Trends" subtitle="Speed in Mbps" index={1}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={speedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="name" tick={chartTickStyle} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={chartTickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="speed" stroke="hsl(217,91%,60%)" strokeWidth={2} dot={{ fill: "hsl(217,91%,60%)" }} animationDuration={1500} animationEasing="ease-out" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Climate Distribution" subtitle="Cities by climate type" index={2}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={climateData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {climateData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Nomad Score Radar" subtitle="Top 5 cities comparison" index={3}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={chartGridColor} />
              <PolarAngleAxis dataKey="city" tick={chartTickStyle} />
              <Radar dataKey="nomad" stroke="hsl(173,58%,39%)" fill="hsl(173,58%,39%)" fillOpacity={0.3} animationDuration={1200} />
              <Radar dataKey="internet" stroke="hsl(217,91%,60%)" fill="hsl(217,91%,60%)" fillOpacity={0.2} animationDuration={1400} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-display font-semibold">Top Nomad Cities</h3>
          </div>
          <div className="space-y-3">
            {topCities.map((c, i) => (
              <button key={c.id} onClick={() => navigate(`/city/${c.id}`)} className="widget-list-item">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <img src={c.image} alt={c.city} className="w-8 h-8 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.city}</p>
                  <p className="text-xs text-muted-foreground">{c.country}</p>
                </div>
                <span className="text-xs font-bold text-primary">{c.nomadScore}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-chart-green" />
            <h3 className="text-sm font-display font-semibold">Cheapest Cities</h3>
          </div>
          <div className="space-y-3">
            {cheapest.map((c, i) => (
              <button key={c.id} onClick={() => navigate(`/city/${c.id}`)} className="widget-list-item">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <img src={c.image} alt={c.city} className="w-8 h-8 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.city}</p>
                  <p className="text-xs text-muted-foreground">{c.country}</p>
                </div>
                <span className="text-xs font-bold text-chart-green">${c.costIndex}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-chart-blue" />
            <h3 className="text-sm font-display font-semibold">Fastest Internet</h3>
          </div>
          <div className="space-y-3">
            {fastest.map((c, i) => (
              <button key={c.id} onClick={() => navigate(`/city/${c.id}`)} className="widget-list-item">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <img src={c.image} alt={c.city} className="w-8 h-8 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.city}</p>
                  <p className="text-xs text-muted-foreground">{c.country}</p>
                </div>
                <span className="text-xs font-bold text-chart-blue">{c.internetSpeed} Mbps</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
