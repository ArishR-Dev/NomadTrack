import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCities } from "@/lib/api";
import { City } from "@/types/city";
import { CityCard } from "@/components/CityCard";
import { CardSkeleton } from "@/components/LoaderSkeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { SlidersHorizontal, X } from "lucide-react";

const CONTINENTS = ["All", "Europe", "Asia", "North America", "South America", "Africa"];
const CLIMATES = ["All", "Mediterranean", "Tropical", "Continental", "Subtropical", "Arid"];

export default function ExploreCities() {
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [budgetMax, setBudgetMax] = useState(100);
  const [speedMin, setSpeedMin] = useState(0);
  const [safetyMin, setSafetyMin] = useState(0);
  const [continent, setContinent] = useState("All");
  const [climate, setClimate] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCities().then(data => { setCities(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return cities.filter(c => {
      if (c.costIndex > budgetMax) return false;
      if (c.internetSpeed < speedMin) return false;
      if (c.safetyScore < safetyMin) return false;
      if (continent !== "All" && c.continent !== continent) return false;
      if (climate !== "All" && c.climate !== climate) return false;
      if (search && !`${c.city} ${c.country}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [cities, budgetMax, speedMin, safetyMin, continent, climate, search]);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Explore Cities</h1>
          <p className="section-subtitle">{filtered.length} cities found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg transition-colors duration-200 hover:bg-secondary"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="glass-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Budget (Cost Index): {budgetMax}</label>
              <input type="range" min={10} max={100} value={budgetMax} onChange={e => setBudgetMax(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Min Internet Speed: {speedMin} Mbps</label>
              <input type="range" min={0} max={100} value={speedMin} onChange={e => setSpeedMin(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Min Safety Score: {safetyMin}</label>
              <input type="range" min={0} max={100} value={safetyMin} onChange={e => setSafetyMin(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Continent</label>
              <select value={continent} onChange={e => setContinent(e.target.value)} className="w-full px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg">
                {CONTINENTS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Climate</label>
              <select value={climate} onChange={e => setClimate(e.target.value)} className="w-full px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg">
                {CLIMATES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by city or country..."
        className="w-full max-w-md px-4 py-2 text-sm bg-secondary border border-border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((city, i) => (
            <CityCard
              key={city.id}
              city={city}
              index={i}
              isFavorite={isFavorite(city.id)}
              onToggleFavorite={toggle}
              onViewDetails={id => navigate(`/city/${id}`)}
              onCompare={id => navigate(`/compare?ids=${id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No cities match your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
