import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCities } from "@/lib/api";
import { calculateNomadScore } from "@/lib/api";
import { City } from "@/types/city";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function getMarkerColor(costIndex: number) {
  return costIndex < 30 ? "#22c55e" : costIndex < 50 ? "#f97316" : "#ef4444";
}

function getMarkerSize(nomadScore: number) {
  return nomadScore >= 85 ? 18 : nomadScore >= 75 ? 14 : 11;
}

function getCostLabel(costIndex: number) {
  return costIndex < 30 ? "Affordable" : costIndex < 50 ? "Moderate" : "Expensive";
}

export default function GlobalMap() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities().then(data => { setCities(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org">OSM</a>',
    }).addTo(map);

    cities.forEach(city => {
      const color = getMarkerColor(city.costIndex);
      const size = getMarkerSize(city.nomadScore);
      const dynamicScore = calculateNomadScore(city);
      const costLabel = getCostLabel(city.costIndex);

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};border:2px solid rgba(255,255,255,0.8);
          box-shadow:0 0 ${size}px ${color}80, 0 2px 8px rgba(0,0,0,0.4);
          transition:transform 0.2s;cursor:pointer;
        " onmouseover="this.style.transform='scale(1.5)'" onmouseout="this.style.transform='scale(1)'"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([city.latitude, city.longitude], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="padding:6px;min-width:240px;font-family:Inter,sans-serif;color:#e2e8f0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <img src="${city.image}" style="width:40px;height:40px;border-radius:8px;object-fit:cover" />
            <div>
              <h3 style="font-weight:700;font-size:14px;margin:0;color:#f1f5f9">${city.city}</h3>
              <p style="font-size:11px;margin:0;color:#94a3b8">${city.country} · ${city.continent}</p>
            </div>
          </div>
          <p style="font-size:10px;color:#64748b;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.5px">Nomad Score · Internet · Cost Index</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin-bottom:10px">
            <div style="background:rgba(255,255,255,0.05);padding:6px 8px;border-radius:6px">
              <div style="color:#94a3b8;font-size:10px">Nomad Score</div>
              <div style="font-weight:700;color:hsl(173,58%,55%)">${dynamicScore}/100</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);padding:6px 8px;border-radius:6px">
              <div style="color:#94a3b8;font-size:10px">Internet</div>
              <div style="font-weight:700;color:hsl(217,91%,70%)">${city.internetSpeed} Mbps</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);padding:6px 8px;border-radius:6px">
              <div style="color:#94a3b8;font-size:10px">Cost Index</div>
              <div style="font-weight:700;color:${color}">${city.costIndex}</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);padding:6px 8px;border-radius:6px">
              <div style="color:#94a3b8;font-size:10px">Cost Level</div>
              <div style="font-weight:700;color:${color}">${costLabel}</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);padding:6px 8px;border-radius:6px;grid-column:1/-1">
              <div style="color:#94a3b8;font-size:10px">Safety</div>
              <div style="font-weight:700;color:#a78bfa">${city.safetyScore}/100</div>
            </div>
          </div>

          <div style="display:flex;gap:4px;margin-bottom:10px">
            <div style="flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,0.1)">
              <div style="height:100%;width:${city.nomadScore}%;border-radius:2px;background:hsl(173,58%,39%)"></div>
            </div>
          </div>

          <button onclick="window.__nomadNavigate(${city.id})" style="
            width:100%;padding:7px 12px;font-size:12px;font-weight:600;
            border:none;border-radius:6px;
            background:linear-gradient(135deg,hsl(173,58%,39%),hsl(190,70%,50%));
            color:white;cursor:pointer;letter-spacing:0.3px
          ">
            View Details →
          </button>
        </div>
      `, { className: "nomad-popup" });
    });

    mapInstanceRef.current = map;
    (window as any).__nomadNavigate = (id: number) => navigate(`/city/${id}`);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      delete (window as any).__nomadNavigate;
    };
  }, [loading, cities, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="text-muted-foreground animate-pulse">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
      <div ref={mapRef} className="h-full w-full z-0" />

      {/* Global Map Intelligence — cost heatmap + nomad score indicators */}
      <div className="absolute bottom-6 left-6 z-[1000] glass-card p-4 space-y-2 animate-fade-in">
        <p className="text-xs font-semibold font-display mb-1">Map Intelligence</p>
        <p className="text-[10px] text-muted-foreground mb-2">Cost heatmap · Marker size = Nomad Score</p>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cost Heatmap</p>
        <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e80" }} /> Green — Cheap</div>
        <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#f97316", boxShadow: "0 0 6px #f9731680" }} /> Orange — Medium</div>
        <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#ef4444", boxShadow: "0 0 6px #ef444480" }} /> Red — Expensive</div>
        <div className="border-t border-border my-1.5" />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nomad Score</p>
        <div className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground shrink-0" /> &lt;75</div>
        <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-muted-foreground shrink-0" /> 75–84</div>
        <div className="flex items-center gap-2 text-xs"><span className="w-4 h-4 rounded-full bg-muted-foreground shrink-0" /> 85+</div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-6 right-6 z-[1000] glass-card p-4 animate-fade-in">
        <p className="text-xs font-semibold font-display mb-2">Quick Stats</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Cities tracked</span><span className="font-bold">{cities.length}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Continents</span><span className="font-bold">{new Set(cities.map(c => c.continent)).size}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Avg Score</span><span className="font-bold">{Math.round(cities.reduce((s, c) => s + c.nomadScore, 0) / cities.length)}</span></div>
        </div>
      </div>
    </div>
  );
}
