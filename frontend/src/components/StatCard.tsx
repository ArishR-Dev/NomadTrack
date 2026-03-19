import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accentColor?: string;
  index?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, accentColor = "text-primary", index = 0 }: StatCardProps) {
  return (
    <div
      className="stat-card opacity-0 animate-fade-in group cursor-default transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-display font-bold transition-colors duration-200 group-hover:text-primary">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-secondary ${accentColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
