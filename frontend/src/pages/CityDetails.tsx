import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCityById, calculateNomadScore } from "@/lib/api";
import { City } from "@/types/city";
import { ChartContainer, CustomTooltip, chartGridColor, chartTickStyle } from "@/components/ChartContainer";
import { StatCard } from "@/components/StatCard";
import { StatSkeleton } from "@/components/LoaderSkeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { DollarSign, Wifi, Shield, Thermometer, MapPin, ArrowLeft, Heart, Database } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";

const COST_BAR_COLORS = ["hsl(142,71%,45%)", "hsl(25,95%,53%)", "hsl(217,91%,60%)", "hsl(262,52%,55%)"];

export default function CityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCityById(Number(id)).then(data => {
        setCity(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-muted-foreground">City not found</p>
        <button onClick={() => navigate("/explore")} className="mt-4 text-sm text-primary underline">Go back to Explore</button>
      </div>
    );
  }

  const costBreakdown = [
    { name: "Rent", cost: city.rent },
    { name: "Food", cost: city.foodCost },
    { name: "Transport", cost: city.transportCost },
    { name: "Coworking", cost: city.coworkingCost },
  ];

  const radarData = [
    { metric: "Affordability", value: Math.min(100, 100 - city.costIndex), fullMark: 100 },
    { metric: "Internet", value: Math.min(100, city.internetSpeed), fullMark: 100 },
    { metric: "Safety", value: city.safetyScore, fullMark: 100 },
    { metric: "Nomad Score", value: city.nomadScore, fullMark: 100 },
    { metric: "Climate", value: Math.min(100, Math.max(0, (50 - Math.abs(city.temperatureAvg - 22)) / 50 * 100)), fullMark: 100 },
  ];

  const totalMonthly = city.rent + city.foodCost + city.transportCost + city.coworkingCost;
  const displayScore = city.nomadScore ?? calculateNomadScore(city);
  const isFav = id ? isFavorite(Number(id)) : false;

  return (
    <div className="page-container pb-24">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Hero — larger, clearer overlay */}
      <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden animate-fade-in shadow-[var(--shadow-floating)]">
        <img src={city.image} alt={city.city} className="w-full h-full object-cover scale-105 transition-transform duration-500 hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white drop-shadow-lg">{city.city}</h1>
            <div className="flex items-center gap-2 mt-2 text-white/90">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-sm">{city.country} · {city.continent}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => id && toggleFavorite(Number(id))}
              className={`p-3 rounded-xl transition-all duration-200 ${isFav ? "bg-destructive/20 text-destructive" : "bg-white/15 text-white hover:bg-white/25"}`}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
            </button>
            <span className="bg-primary/90 text-primary-foreground text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg">
              Nomad Score: {displayScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <section className="mt-8">
        <h2 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-4">Key metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Cost Index" value={`$${city.costIndex}`} subtitle="Monthly avg cost indicator" icon={DollarSign} accentColor="text-chart-green" index={0} />
          <StatCard title="Internet Speed" value={`${city.internetSpeed} Mbps`} subtitle="Average download speed" icon={Wifi} accentColor="text-chart-blue" index={1} />
          <StatCard title="Safety Score" value={`${city.safetyScore}/100`} subtitle="Overall safety rating" icon={Shield} accentColor="text-chart-purple" index={2} />
          <StatCard title="Temperature" value={`${city.temperatureAvg}°C`} subtitle={city.climate} icon={Thermometer} accentColor="text-chart-orange" index={3} />
        </div>
      </section>

      {/* Charts — enhanced */}
      <section className="mt-10">
        <h2 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-4">Charts & breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Monthly Cost Breakdown" subtitle={`Total: $${totalMonthly}/month · Rent, food, transport, coworking`} index={0}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costBreakdown} margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="name" tick={chartTickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={chartTickStyle} tickFormatter={v => `$${v}`} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]} animationDuration={800} animationEasing="ease-out">
                  <LabelList dataKey="cost" position="top" formatter={(v: number) => `$${v}`} className="text-xs fill-muted-foreground" />
                  {costBreakdown.map((_, i) => (
                    <Cell key={i} fill={COST_BAR_COLORS[i % COST_BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Quality of Life Radar" subtitle="Affordability, internet, safety, nomad score, climate (0–100)" index={1}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                <PolarGrid stroke={chartGridColor} />
                <PolarAngleAxis dataKey="metric" tick={chartTickStyle} />
                <Radar name="Score" dataKey="value" stroke="hsl(262,52%,55%)" fill="hsl(262,52%,55%)" fillOpacity={0.35} strokeWidth={2} animationDuration={1000} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </section>

      {/* Info cards */}
      <section className="mt-10">
        <h2 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-display font-semibold">City information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Climate</span><span className="font-medium">{city.climate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Avg temperature</span><span className="font-medium">{city.temperatureAvg}°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Internet speed</span><span className="font-medium">{city.internetSpeed} Mbps</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Coworking</span><span className="font-medium">${city.coworkingCost}/mo</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Digital nomad visa</span><span className="font-medium">Check locally</span></div>
            </div>
          </div>
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-display font-semibold">Monthly expenses</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Rent</span><span className="font-medium">${city.rent}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Food</span><span className="font-medium">${city.foodCost}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transport</span><span className="font-medium">${city.transportCost}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Coworking</span><span className="font-medium">${city.coworkingCost}</span></div>
              <div className="flex justify-between border-t border-border pt-3 mt-1"><span className="font-semibold">Total</span><span className="font-bold text-primary">${totalMonthly}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Data source note */}
      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Database className="w-3.5 h-3.5 shrink-0" />
        <span>Data from platform database (MySQL). Nomad score is computed from internet, safety, cost, and climate.</span>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <button onClick={() => navigate(`/compare?ids=${city.id}`)} className="px-5 py-2.5 text-sm font-medium gradient-primary text-primary-foreground rounded-lg transition-opacity duration-200 hover:opacity-90 shadow-[var(--shadow-card)]">
          Compare with other cities
        </button>
      </div>
    </div>
  );
}
