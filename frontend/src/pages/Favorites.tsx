import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCities } from "@/lib/api";
import { City } from "@/types/city";
import { CityCard } from "@/components/CityCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart } from "lucide-react";

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggle, isFavorite } = useFavorites();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities().then(data => { setCities(data); setLoading(false); });
  }, []);

  const favCities = cities.filter(c => favorites.includes(c.id));

  return (
    <div className="page-container">
      <div>
        <h1 className="section-title">Favorites</h1>
        <p className="section-subtitle">{favCities.length} saved cities</p>
      </div>

      {favCities.length > 1 && (
        <button
          onClick={() => navigate(`/compare?ids=${favCities.map(c => c.id).join(",")}`)}
          className="px-4 py-2 text-sm font-medium gradient-primary text-primary-foreground rounded-lg transition-opacity duration-200 hover:opacity-90"
        >
          Quick Compare ({favCities.length})
        </button>
      )}

      {favCities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favCities.map((city, i) => (
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
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No favorites yet</p>
          <button onClick={() => navigate("/explore")} className="mt-3 text-sm text-primary underline">
            Explore cities to add favorites
          </button>
        </div>
      )}
    </div>
  );
}
