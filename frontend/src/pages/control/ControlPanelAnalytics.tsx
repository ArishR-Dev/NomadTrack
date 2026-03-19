import { useEffect, useMemo, useState } from "react";
import { ControlPanelLayout } from "@/pages/control/ControlPanelLayout";
import { fetchConsoleAnalytics, type ControlConsoleAnalytics } from "@/lib/api";
import { ChartContainer, CustomTooltip, chartGridColor, chartTickStyle } from "@/components/ChartContainer";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { toast } from "sonner";

const COLORS = ["hsl(173,58%,39%)", "hsl(217,91%,60%)", "hsl(262,52%,55%)", "hsl(25,95%,53%)"];

export default function ControlPanelAnalytics() {
  const [data, setData] = useState<ControlConsoleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsoleAnalytics()
      .then(setData)
      .catch(() => toast.error("Analytics unavailable"))
      .finally(() => setLoading(false));
  }, []);

  const favBars = useMemo(
    () => (data ? data.topFavoritedCities.map((c) => ({ name: c.city, value: c.favorites })) : []),
    [data]
  );

  return (
    <ControlPanelLayout title="Control Center" subtitle="System analytics snapshots">
      <ChartContainer
        title="Most favorited cities"
        subtitle={loading ? "Loading..." : `Top city: ${data?.mostFavoritedCity ?? "—"}`}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={favBars} margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
            <XAxis dataKey="name" tick={chartTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={900}>
              {favBars.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ControlPanelLayout>
  );
}

