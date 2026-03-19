import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Compass, Map, GitCompare, TrendingUp, Heart, User
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const dockItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Explore", path: "/explore", icon: Compass },
  { title: "Map", path: "/map", icon: Map },
  { title: "Compare", path: "/compare", icon: GitCompare },
  { title: "Insights", path: "/insights", icon: TrendingUp },
  { title: "Favorites", path: "/favorites", icon: Heart },
  { title: "Profile", path: "/profile", icon: User },
];

export function FloatingDock() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.35;
    if (distance === 1) return 1.15;
    return 1;
  };

  const getTranslateY = (index: number) => {
    if (hoveredIndex === null) return 0;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return -8;
    if (distance === 1) return -4;
    return 0;
  };

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="flex items-end gap-1 px-3 py-2.5 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {dockItems.map((item, index) => {
          const active = location.pathname === item.path;
          const scale = getScale(index);
          const translateY = getTranslateY(index);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredIndex(index)}
              className="relative group flex flex-col items-center"
            >
              {/* Tooltip */}
              <span
                className={`absolute -top-9 px-2.5 py-1 text-xs font-medium rounded-lg bg-foreground text-background whitespace-nowrap transition-all duration-200 pointer-events-none ${
                  hoveredIndex === index ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-1"
                }`}
              >
                {item.title}
              </span>

              <div
                className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ease-out ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <item.icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary-foreground" />
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
