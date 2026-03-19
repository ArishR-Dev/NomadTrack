import { useEffect, useRef, useState } from "react";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  index?: number;
}

export function ChartContainer({ title, subtitle, children, index = 0 }: ChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`glass-card p-6 transition-all duration-500 ease-out group hover:shadow-[var(--shadow-elevated)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-display font-semibold transition-colors duration-200 group-hover:text-primary">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="w-2 h-2 rounded-full bg-primary/40 transition-all duration-300 group-hover:bg-primary group-hover:scale-125" />
      </div>
      <div className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: `${index * 100 + 200}ms` }}>
        {children}
      </div>
    </div>
  );
}

// Shared chart theme helpers
export const chartGridColor = "hsl(var(--border))";
export const chartTickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

export function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm px-3 py-2 shadow-[var(--shadow-floating)]">
      {label && <p className="text-xs font-medium text-foreground mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color || entry.stroke || "hsl(var(--primary))" }}>
          {entry.name}: <span className="font-semibold">{typeof entry.value === "number" && entry.name?.toLowerCase().includes("budget") ? `$${entry.value}` : entry.value}</span>
        </p>
      ))}
    </div>
  );
}
