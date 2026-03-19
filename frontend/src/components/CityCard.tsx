import { City } from "@/types/city";
import { Heart, ArrowRight, Wifi, Shield, DollarSign } from "lucide-react";

interface CityCardProps {
  city: City;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onViewDetails?: (id: number) => void;
  onCompare?: (id: number) => void;
  index?: number;
}

export function CityCard({ city, isFavorite, onToggleFavorite, onViewDetails, onCompare, index = 0 }: CityCardProps) {
  return (
    <div
      className="glass-card-hover group overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "forwards" }}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={city.image}
          alt={city.city}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent transition-opacity duration-300 group-hover:from-foreground/70" />
        <button
          onClick={() => onToggleFavorite?.(city.id)}
          className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isFavorite
                ? "fill-destructive text-destructive scale-110"
                : "text-muted-foreground group-hover:text-foreground"
            }`}
          />
        </button>
        <div className="absolute bottom-3 left-3 transition-transform duration-300 group-hover:translate-x-1">
          <h3 className="text-lg font-display font-bold text-primary-foreground drop-shadow-md">{city.city}</h3>
          <p className="text-sm text-primary-foreground/80">{city.country}</p>
        </div>
        <div className="absolute bottom-3 right-3 transition-transform duration-300 group-hover:scale-105">
          <span className="gradient-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            {city.nomadScore}/100
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-1.5 group/stat">
            <DollarSign className="w-3.5 h-3.5 text-chart-green transition-transform duration-200 group-hover/stat:scale-125" />
            <span className="text-xs text-muted-foreground">${city.costIndex}</span>
          </div>
          <div className="flex items-center gap-1.5 group/stat">
            <Wifi className="w-3.5 h-3.5 text-chart-blue transition-transform duration-200 group-hover/stat:scale-125" />
            <span className="text-xs text-muted-foreground">{city.internetSpeed} Mbps</span>
          </div>
          <div className="flex items-center gap-1.5 group/stat">
            <Shield className="w-3.5 h-3.5 text-chart-purple transition-transform duration-200 group-hover/stat:scale-125" />
            <span className="text-xs text-muted-foreground">{city.safetyScore}/100</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="px-2 py-0.5 bg-secondary rounded-full transition-colors duration-200 hover:bg-primary/10 hover:text-primary">{city.climate}</span>
          <span>{city.continent}</span>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onViewDetails?.(city.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium gradient-primary text-primary-foreground rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.97] group/btn"
          >
            Details <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </button>
          <button
            onClick={() => onCompare?.(city.id)}
            className="py-2 px-3 text-xs font-medium border border-border rounded-lg transition-all duration-200 hover:bg-secondary hover:border-primary/30 active:scale-[0.97]"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
