import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCities, compareCities } from "@/lib/api";
import { City } from "@/types/city";
import { ChartContainer, CustomTooltip, chartGridColor, chartTickStyle } from "@/components/ChartContainer";
import { X, Trophy, Wifi, Shield, DollarSign, Thermometer, Home, UtensilsCrossed, Bus, Laptop } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from "recharts";

const COLORS = ["hsl(173,58%,39%)", "hsl(217,91%,60%)", "hsl(262,52%,55%)", "hsl(25,95%,53%)"];

function AwardCard({ icon: Icon, label, city, image }: { icon: React.ElementType; label: string; city: string; image?: string }) {
  return (
    <div className="glass-card p-5 flex flex-col items-center gap-2 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {image && (
          <img src={image} alt={city} className="w-8 h-8 rounded-full object-cover border-2 border-border shrink-0" />
        )}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-display font-bold text-foreground">{city}</span>
    </div>
  );
}

export default function CityComparison() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allCities, setAllCities] = useState<City[]>([]);
  const [selected, setSelected] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities().then(data => { setAllCities(data); setLoading(false); });
  }, []);

  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (idsParam && allCities.length) {
      const ids = idsParam.split(",").map(Number).filter(Boolean);
      compareCities(ids).then(setSelected);
    }
  }, [searchParams, allCities]);

  const addCity = (id: number) => {
    if (selected.length >= 4) return;
    const ids = [...selected.map(c => c.id), id];
    setSearchParams({ ids: ids.join(",") });
  };

  const removeCity = (id: number) => {
    const ids = selected.filter(c => c.id !== id).map(c => c.id);
    setSearchParams(ids.length ? { ids: ids.join(",") } : {});
    setSelected(s => s.filter(c => c.id !== id));
  };

  const cheapest = selected.length ? selected.reduce((a, b) => a.costIndex < b.costIndex ? a : b) : null;
  const fastestNet = selected.length ? selected.reduce((a, b) => a.internetSpeed > b.internetSpeed ? a : b) : null;
  const safest = selected.length ? selected.reduce((a, b) => a.safetyScore > b.safetyScore ? a : b) : null;
  const bestNomad = selected.length ? selected.reduce((a, b) => a.nomadScore > b.nomadScore ? a : b) : null;

  const costData = selected.map(c => ({ name: c.city, rent: c.rent, food: c.foodCost, transport: c.transportCost, coworking: c.coworkingCost }));

  const budgetData = selected.map(c => ({
    name: c.city,
    total: c.rent + c.foodCost + c.transportCost + c.coworkingCost,
  }));

  const radarData = ["Affordability", "Internet", "Safety", "Nomad Score", "Climate"].map(metric => {
    const d: Record<string, string | number> = { metric };
    selected.forEach(c => {
      d[c.city] = metric === "Affordability" ? 100 - c.costIndex : metric === "Internet" ? c.internetSpeed : metric === "Safety" ? c.safetyScore : metric === "Nomad Score" ? c.nomadScore : Math.min(100, c.temperatureAvg * 4);
    });
    return d;
  });

  const availableCities = allCities.filter(c => !selected.find(s => s.id === c.id));

  const metrics = [
    { label: "Cost Index", key: "costIndex" as keyof City, icon: DollarSign, unit: "", best: "low" },
    { label: "Internet Speed", key: "internetSpeed" as keyof City, icon: Wifi, unit: " Mbps", best: "high" },
    { label: "Safety Score", key: "safetyScore" as keyof City, icon: Shield, unit: "/100", best: "high" },
    { label: "Nomad Score", key: "nomadScore" as keyof City, icon: Trophy, unit: "/100", best: "high" },
    { label: "Rent", key: "rent" as keyof City, icon: Home, unit: "", best: "low", prefix: "$" },
    { label: "Food Cost", key: "foodCost" as keyof City, icon: UtensilsCrossed, unit: "", best: "low", prefix: "$" },
    { label: "Transport", key: "transportCost" as keyof City, icon: Bus, unit: "", best: "low", prefix: "$" },
    { label: "Coworking", key: "coworkingCost" as keyof City, icon: Laptop, unit: "", best: "low", prefix: "$" },
    { label: "Temperature", key: "temperatureAvg" as keyof City, icon: Thermometer, unit: "°C", best: "none" },
  ];

  const getBestValue = (key: keyof City, best: string) => {
    if (!selected.length || best === "none") return null;
    const vals = selected.map(c => Number(c[key]));
    return best === "high" ? Math.max(...vals) : Math.min(...vals);
  };

  return (
    <div className="page-container pb-24">
      <div>
        <h1 className="section-title">City Comparison</h1>
        <p className="section-subtitle">Compare up to 4 cities side by side</p>
      </div>

      <div className="glass-card p-5 animate-fade-in">
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((c, i) => (
            <span key={c.id} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full" style={{ backgroundColor: `${COLORS[i]}20`, color: COLORS[i] }}>
              <img src={c.image} alt={c.city} className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/30" />
              {c.city}
              <button onClick={() => removeCity(c.id)} className="hover:opacity-70" aria-label={`Remove ${c.city}`}><X className="w-3.5 h-3.5" /></button>
            </span>
          ))}
        </div>
        {selected.length < 4 && (
          <select
            onChange={e => { if (e.target.value) addCity(Number(e.target.value)); e.target.value = ""; }}
            className="px-3 py-2 text-sm bg-secondary border border-border rounded-lg outline-none"
            defaultValue=""
          >
            <option value="" disabled>Add a city...</option>
            {availableCities.map(c => <option key={c.id} value={c.id}>{c.city}, {c.country}</option>)}
          </select>
        )}
      </div>

      {selected.length >= 2 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {cheapest && <AwardCard icon={DollarSign} label="Most Affordable" city={cheapest.city} image={cheapest.image} />}
            {fastestNet && <AwardCard icon={Wifi} label="Fastest Internet" city={fastestNet.city} image={fastestNet.image} />}
            {safest && <AwardCard icon={Shield} label="Safest" city={safest.city} image={safest.image} />}
            {bestNomad && <AwardCard icon={Trophy} label="Best for Nomads" city={bestNomad.city} image={bestNomad.image} />}
          </div>

          <ChartContainer title="Monthly Budget Comparison" subtitle="Total estimated monthly cost">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={budgetData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                <XAxis type="number" tick={chartTickStyle} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={chartTickStyle} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {budgetData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="glass-card overflow-x-auto animate-fade-in">
            <div className="p-4 border-b border-border">
              <h3 className="text-base font-display font-semibold text-foreground">Detailed Metrics</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Metric</th>
                  {selected.map((c, i) => (
                    <th key={c.id} className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: COLORS[i] }}>{c.city}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metrics.map(row => {
                  const bestVal = getBestValue(row.key, row.best);
                  return (
                    <tr key={row.label} className="transition-colors hover:bg-secondary/50">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <row.icon className="w-4 h-4 text-muted-foreground" />
                        {row.label}
                      </td>
                      {selected.map(c => {
                        const val = c[row.key];
                        const numVal = Number(val);
                        const isBest = bestVal !== null && numVal === bestVal;
                        return (
                          <td key={c.id} className={`px-4 py-3 ${isBest ? "font-bold text-primary" : ""}`}>
                            {(row as any).prefix || ""}{val}{row.unit}
                            {isBest && <span className="ml-1.5 text-xs">✦</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartContainer title="Cost Breakdown" subtitle="Monthly expenses by category">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="name" tick={chartTickStyle} />
                  <YAxis tick={chartTickStyle} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="rent" name="Rent" fill={COLORS[0]} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="food" name="Food" fill={COLORS[1]} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="transport" name="Transport" fill={COLORS[2]} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="coworking" name="Coworking" fill={COLORS[3]} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Overall Score Radar" subtitle="Multi-metric comparison">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={chartGridColor} />
                  <PolarAngleAxis dataKey="metric" tick={chartTickStyle} />
                  {selected.map((c, i) => (
                    <Radar key={c.id} dataKey={c.city} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                  ))}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </>
      )}

      {selected.length < 2 && (
        <div className="text-center py-16 text-muted-foreground animate-fade-in">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-display font-medium">Select at least 2 cities to start comparing</p>
          <p className="text-sm mt-1">Choose from the dropdown above to get started</p>
        </div>
      )}
    </div>
  );
}
