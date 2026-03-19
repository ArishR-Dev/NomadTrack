import { useState, useCallback, useEffect } from "react";
import { apiFetch, getToken } from "@/lib/apiClient";

const STORAGE_KEY = "nomadtrack-favorites";

function getStoredLocal(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(getStoredLocal);
  const isLoggedIn = !!getToken();

  // Sync from API if authenticated
  useEffect(() => {
    if (isLoggedIn) {
      apiFetch<{ city_id: number }[]>("/api/favorites")
        .then(data => {
          const ids = data.map(f => f.city_id);
          setFavorites(ids);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        })
        .catch(() => {
          // Fall back to localStorage
        });
    }
  }, [isLoggedIn]);

  const toggle = useCallback((id: number) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const next = isFav ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      // Sync to API if authenticated
      if (getToken()) {
        if (isFav) {
          apiFetch(`/api/favorites/${id}`, { method: "DELETE" }).catch(() => {});
        } else {
          apiFetch("/api/favorites", {
            method: "POST",
            body: JSON.stringify({ cityId: id }),
          }).catch(() => {});
        }
      }

      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
