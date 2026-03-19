import { City } from "@/types/city";
import { apiFetch } from "@/lib/apiClient";

export interface Analytics {
  totalCities: number;
  avgNomadScore: number;
  cheapestCity: string;
  fastestInternet: string;
  mostFavorited: string;
  mostFavoritedCount: number;
}

export async function fetchAnalytics(): Promise<Analytics> {
  return apiFetch<Analytics>("/api/analytics");
}

export async function fetchCities(): Promise<City[]> {
  return apiFetch<City[]>("/api/cities");
}

export async function fetchCityById(id: number): Promise<City | undefined> {
  try {
    return await apiFetch<City>(`/api/cities/${id}`);
  } catch {
    return undefined;
  }
}

export async function fetchTopCities(limit = 5): Promise<City[]> {
  return apiFetch<City[]>(`/api/cities/top?limit=${limit}`);
}

export async function fetchCheapestCities(limit = 5): Promise<City[]> {
  return apiFetch<City[]>(`/api/cities/cheapest?limit=${limit}`);
}

export async function fetchFastestInternetCities(limit = 5): Promise<City[]> {
  return apiFetch<City[]>(`/api/cities/fastest?limit=${limit}`);
}

export async function compareCities(ids: number[]): Promise<City[]> {
  return apiFetch<City[]>(`/api/cities/compare?ids=${ids.join(",")}`);
}

// Internal control console API (requires auth + role=admin)
export interface ControlConsoleAnalytics {
  totalUsers: number;
  totalCities: number;
  totalFavorites: number;
  mostFavoritedCity: string;
  apiStatus: string;
  dbStatus: string;
  uptimeSeconds: number;
  topFavoritedCities: { city: string; favorites: number }[];
}

export interface ControlConsoleUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  role: "user" | "admin";
}

export async function fetchConsoleAnalytics(): Promise<ControlConsoleAnalytics> {
  return apiFetch<ControlConsoleAnalytics>("/api/admin/analytics");
}

export async function fetchConsoleUsers(): Promise<ControlConsoleUser[]> {
  return apiFetch<ControlConsoleUser[]>("/api/admin/users");
}

export async function deleteConsoleUser(userId: number): Promise<void> {
  await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
}

export async function fetchConsoleUserFavorites(userId: number): Promise<{ city_id: number }[] & City[]> {
  return apiFetch<any>(`/api/admin/users/${userId}/favorites`);
}

export async function fetchConsoleCities(): Promise<City[]> {
  return apiFetch<City[]>("/api/admin/cities");
}

export async function createCity(data: Partial<City>): Promise<City> {
  return apiFetch<City>("/api/admin/cities", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCity(id: number, data: Partial<City>): Promise<City> {
  return apiFetch<City>(`/api/admin/cities/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteCity(id: number): Promise<void> {
  await apiFetch(`/api/admin/cities/${id}`, { method: "DELETE" });
}

export async function importCities(rows: Partial<City>[]): Promise<void> {
  await apiFetch("/api/admin/import-cities", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });
}

// Import batch history
export interface ImportBatchSummary {
  id: number;
  filename: string;
  createdAt: string;
  importedByEmail: string | null;
  cityCount: number;
}

export async function fetchImportBatches(): Promise<ImportBatchSummary[]> {
  return apiFetch<ImportBatchSummary[]>("/api/admin/import-batches");
}

export async function fetchImportBatchCities(batchId: number): Promise<City[]> {
  return apiFetch<City[]>(`/api/admin/import-batches/${batchId}/cities`);
}

export async function deleteImportBatchCities(batchId: number): Promise<void> {
  await apiFetch(`/api/admin/import-batches/${batchId}/cities`, { method: "DELETE" });
}

export async function deleteImportBatch(batchId: number): Promise<void> {
  await apiFetch(`/api/admin/import-batches/${batchId}`, { method: "DELETE" });
}

// Deleted cities archive
export interface DeletedCitySummary {
  id: number;
  city: string;
  country: string;
  continent: string;
  deletedAt: string;
  deletedByEmail: string | null;
}

export async function fetchDeletedCities(): Promise<DeletedCitySummary[]> {
  return apiFetch<DeletedCitySummary[]>("/api/admin/deleted-cities");
}

export async function restoreDeletedCity(archiveId: number): Promise<City> {
  const res = await apiFetch<{ city: City }>(`/api/admin/deleted-cities/${archiveId}/restore`, {
    method: "POST",
  });
  return res.city;
}

// Auth helpers
export async function resetPassword(token: string, password: string): Promise<void> {
  await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

// Dynamic Nomad Score Calculator
export function calculateNomadScore(city: City): number {
  const internetScore = city.internetSpeed * 0.3;
  const safetyScore = city.safetyScore * 10 * 0.2;
  const costScore = (100 - city.costIndex) * 0.3;
  const climateScore = ((50 - Math.abs(city.temperatureAvg - 22)) / 50) * 100 * 0.2;
  return Math.min(100, Math.max(0, Math.round(internetScore + safetyScore + costScore + climateScore)));
}
