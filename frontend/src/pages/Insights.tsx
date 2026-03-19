import { useEffect, useState } from "react";
import { fetchCities } from "@/lib/api";
import { City } from "@/types/city";
import { ChartContainer, CustomTooltip, chartGridColor, chartTickStyle } from "@/components/ChartContainer";
import { StatSkeleton } from "@/components/LoaderSkeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function Insights() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities().then(data => { setCities(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
    );
  }

  const cheapest = [...cities].sort((a, b) => a.costIndex - b.costIndex).slice(0, 10);
  const bestNomad = [...cities].sort((a, b) => b.nomadScore - a.nomadScore).slice(0, 10);
  const fastestInternet = [...cities].sort((a, b) => b.internetSpeed - a.internetSpeed).slice(0, 10);
  const safest = [...cities].sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 10);

  return (
    <div className="page-container pb-24">
      <div>
        <h1 className="section-title">Insights</h1>
        <p className="section-subtitle">Deep analytics and rankings across all cities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer title="Top 10 Cheapest Cities" subtitle="By cost index">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cheapest.map(c => ({ name: c.city, cost: c.costIndex }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
              <XAxis type="number" tick={chartTickStyle} />
              <YAxis type="category" dataKey="name" tick={chartTickStyle} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost" fill="hsl(142,71%,45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Best Cities for Remote Work" subtitle="By nomad score">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bestNomad.map(c => ({ name: c.city, score: c.nomadScore }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
              <XAxis type="number" tick={chartTickStyle} />
              <YAxis type="category" dataKey="name" tick={chartTickStyle} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="hsl(173,58%,39%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Fastest Internet Cities" subtitle="By speed (Mbps)">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={fastestInternet.map(c => ({ name: c.city, speed: c.internetSpeed }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
              <XAxis type="number" tick={chartTickStyle} />
              <YAxis type="category" dataKey="name" tick={chartTickStyle} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="speed" fill="hsl(217,91%,60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Safest Cities" subtitle="By safety score">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={safest.map(c => ({ name: c.city, safety: c.safetyScore }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
              <XAxis type="number" tick={chartTickStyle} />
              <YAxis type="category" dataKey="name" tick={chartTickStyle} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="safety" fill="hsl(262,52%,55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
