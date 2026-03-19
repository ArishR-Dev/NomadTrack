// API configuration
// Change this to your backend server URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Auth token management
export function getToken(): string | null {
  return localStorage.getItem("nomadtrack-token");
}

export function setToken(token: string): void {
  localStorage.setItem("nomadtrack-token", token);
}

export function removeToken(): void {
  localStorage.removeItem("nomadtrack-token");
}

// Authenticated fetch wrapper
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  // Temporary debug: confirm every API request uses the configurable base URL
  if (import.meta.env.DEV) {
    console.log("[NomadTrack API]", url);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}
