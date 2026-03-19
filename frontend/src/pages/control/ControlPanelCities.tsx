import { useEffect, useMemo, useState } from "react";
import { ControlPanelLayout } from "@/pages/control/ControlPanelLayout";
import {
  createCity,
  deleteCity,
  fetchConsoleCities,
  importCities,
  updateCity,
  fetchImportBatches,
  fetchImportBatchCities,
  deleteImportBatchCities,
  deleteImportBatch,
  fetchDeletedCities,
  restoreDeletedCity,
  type ImportBatchSummary,
  type DeletedCitySummary,
} from "@/lib/api";
import { City } from "@/types/city";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

type DraftCity = Partial<City> & { id?: number };

function emptyDraft(): DraftCity {
  return {
    city: "",
    country: "",
    continent: "Europe",
    costIndex: 30,
    internetSpeed: 50,
    safetyScore: 70,
    climate: "Temperate",
    rent: 600,
    foodCost: 200,
    transportCost: 40,
    coworkingCost: 120,
    temperatureAvg: 20,
    latitude: 0,
    longitude: 0,
    image: "",
  };
}

export default function ControlPanelCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DraftCity | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [importing, setImporting] = useState(false);
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [batchCities, setBatchCities] = useState<City[]>([]);
  const [loadingBatchCities, setLoadingBatchCities] = useState(false);
  const [deletedCities, setDeletedCities] = useState<DeletedCitySummary[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);

  useEffect(() => {
    fetchConsoleCities()
      .then(setCities)
      .catch(() => toast.error("Failed to load cities"))
      .finally(() => setLoading(false));
    setLoadingBatches(true);
    fetchImportBatches()
      .then(setBatches)
      .catch(() => toast.error("Failed to load import history"))
      .finally(() => setLoadingBatches(false));
    setLoadingDeleted(true);
    fetchDeletedCities()
      .then(setDeletedCities)
      .catch(() => toast.error("Failed to load deleted cities"))
      .finally(() => setLoadingDeleted(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => `${c.city} ${c.country} ${c.continent}`.toLowerCase().includes(q));
  }, [cities, query]);

  const startEdit = (city?: City) => {
    setEditing(city ? { ...city } : emptyDraft());
  };

  const stopEdit = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    if (!editing.city || !editing.country || !editing.continent) {
      toast.error("City, country, and continent are required");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const updated = await updateCity(editing.id, editing);
        setCities((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success("City updated");
      } else {
        const created = await createCity(editing);
        setCities((prev) => [created, ...prev]);
        toast.success("City created");
      }
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this city? This cannot be undone.")) return;
    try {
      await deleteCity(id);
      setCities((prev) => prev.filter((c) => c.id !== id));
      setDeletedCities((prev) => prev); // archive list will be refreshed from server when needed
      toast.success("City deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (!lines.length) {
        toast.error("Empty CSV");
        return;
      }
      const [headerLine, ...rowsLines] = lines;
      const headers = headerLine.split(",").map((h) => h.trim());
      const mapRow = (line: string): DraftCity => {
        const cols = line.split(",").map((c) => c.trim());
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = cols[i];
        });
        const numberFields = [
          "costIndex",
          "internetSpeed",
          "safetyScore",
          "rent",
          "foodCost",
          "transportCost",
          "coworkingCost",
          "temperatureAvg",
          "latitude",
          "longitude",
        ];
        numberFields.forEach((f) => {
          if (obj[f] !== undefined && obj[f] !== "") {
            obj[f] = Number(obj[f]);
          }
        });
        return obj;
      };
      const parsed = rowsLines.map(mapRow).filter((r) => r.city && r.country && r.continent);
      if (!parsed.length) {
        toast.error("No valid rows found in CSV");
        return;
      }
      await importCities(parsed);
      toast.success(`Imported ${parsed.length} cities`);
      // refresh list
      const updated = await fetchConsoleCities();
      setCities(updated);
      const updatedBatches = await fetchImportBatches();
      setBatches(updatedBatches);
    } catch (err: any) {
      toast.error(err?.message || "Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data) || !data.length) {
        toast.error("JSON must be an array of city objects");
        return;
      }
      const numberFields = [
        "costIndex",
        "internetSpeed",
        "safetyScore",
        "rent",
        "foodCost",
        "transportCost",
        "coworkingCost",
        "temperatureAvg",
        "latitude",
        "longitude",
      ];
      const parsed: DraftCity[] = data
        .map((item: any) => {
          if (!item.city || !item.country || !item.continent) return null;
          const obj: any = { ...item };
          numberFields.forEach((f) => {
            if (obj[f] !== undefined && obj[f] !== null && obj[f] !== "") {
              obj[f] = Number(obj[f]);
            }
          });
          return obj;
        })
        .filter(Boolean);

      if (!parsed.length) {
        toast.error("No valid city objects found in JSON");
        return;
      }

      await importCities(parsed);
      toast.success(`Imported ${parsed.length} cities from JSON`);
      const updated = await fetchConsoleCities();
      setCities(updated);
      const updatedBatches = await fetchImportBatches();
      setBatches(updatedBatches);
    } catch (err: any) {
      toast.error(err?.message || "JSON import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(cities, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cities.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadBatchCities = async (batchId: number) => {
    setSelectedBatchId(batchId);
    setLoadingBatchCities(true);
    try {
      const rows = await fetchImportBatchCities(batchId);
      setBatchCities(rows);
    } catch {
      toast.error("Failed to load batch cities");
    } finally {
      setLoadingBatchCities(false);
    }
  };

  const clearBatchCities = async (batchId: number) => {
    if (!confirm("Delete all cities imported from this CSV? This cannot be undone.")) return;
    try {
      await deleteImportBatchCities(batchId);
      toast.success("Deleted cities for this import");
      // refresh main cities list and batch cities list
      const updated = await fetchConsoleCities();
      setCities(updated);
      if (selectedBatchId === batchId) {
        setBatchCities([]);
      }
      const deleted = await fetchDeletedCities();
      setDeletedCities(deleted);
    } catch {
      toast.error("Failed to delete cities for this import");
    }
  };

  const refreshDeleted = async () => {
    setLoadingDeleted(true);
    try {
      const data = await fetchDeletedCities();
      setDeletedCities(data);
    } catch {
      toast.error("Failed to refresh deleted cities");
    } finally {
      setLoadingDeleted(false);
    }
  };

  const restore = async (archiveId: number) => {
    try {
      const restored = await restoreDeletedCity(archiveId);
      setCities((prev) => [restored, ...prev].sort((a, b) => a.city.localeCompare(b.city)));
      setDeletedCities((prev) => prev.filter((d) => d.id !== archiveId));
      toast.success("City restored");
    } catch (err: any) {
      toast.error(err?.message || "Restore failed");
    }
  };

  const removeBatch = async (batchId: number) => {
    if (!confirm("Delete this import entry from history? Cities will NOT be affected.")) return;
    try {
      await deleteImportBatch(batchId);
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
      if (selectedBatchId === batchId) {
        setSelectedBatchId(null);
        setBatchCities([]);
      }
      toast.success("Import history entry deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete import history");
    }
  };

  return (
    <ControlPanelLayout title="Platform Console" subtitle="Cities catalog management">
      <div className="glass-card p-4 mb-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities..."
            className="px-3 py-2 text-sm bg-secondary border border-border rounded-lg outline-none w-[260px] max-w-full"
          />
          <span className="text-xs text-muted-foreground">{loading ? "Loading..." : `${filtered.length} cities`}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => startEdit()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add city
          </button>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-secondary/60 hover:bg-secondary cursor-pointer">
            <span>{importing ? "Importing..." : "Import CSV"}</span>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} disabled={importing} />
          </label>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-secondary/60 hover:bg-secondary cursor-pointer">
            <span>{importing ? "Importing..." : "Import JSON"}</span>
            <input type="file" accept=".json,application/json" className="hidden" onChange={handleImportJson} disabled={importing} />
          </label>
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-secondary/60 hover:bg-secondary"
          >
            Download JSON
          </button>
        </div>
      </div>

      {editing && (
        <div className="glass-card p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-display font-semibold">{editing.id ? "Edit city" : "New city"}</h3>
              <p className="text-xs text-muted-foreground">Update core fields. Nomad score is computed dynamically by the backend.</p>
            </div>
            <button onClick={stopEdit} className="p-2 rounded-lg hover:bg-secondary" aria-label="Close">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ["city", "City"],
              ["country", "Country"],
              ["continent", "Continent"],
              ["climate", "Climate"],
              ["image", "Image URL"],
            ].map(([k, label]) => (
              <div key={k} className="space-y-1">
                <label className="text-xs text-muted-foreground">{label}</label>
                <input
                  value={(editing as any)[k] ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...(p as any), [k]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg outline-none"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              ["costIndex", "Cost Index"],
              ["internetSpeed", "Internet (Mbps)"],
              ["safetyScore", "Safety (0-100)"],
              ["rent", "Rent ($)"],
              ["foodCost", "Food ($)"],
              ["transportCost", "Transport ($)"],
              ["coworkingCost", "Coworking ($)"],
              ["temperatureAvg", "Temp (°C)"],
              ["latitude", "Latitude"],
              ["longitude", "Longitude"],
            ].map(([k, label]) => (
              <div key={k} className="space-y-1">
                <label className="text-xs text-muted-foreground">{label}</label>
                <input
                  type="number"
                  value={(editing as any)[k] ?? 0}
                  onChange={(e) => setEditing((p) => ({ ...(p as any), [k]: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={stopEdit} className="px-4 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[2fr,1.5fr] gap-4">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cities</h3>
            <span className="text-[11px] text-muted-foreground">
              {loading ? "Loading..." : `${cities.length} total`}
            </span>
          </div>
          <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">City</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Country</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cost</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Internet</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium flex items-center gap-3">
                      <img src={c.image} alt={c.city} className="w-9 h-9 rounded-lg object-cover border border-border" />
                      <div className="min-w-0">
                        <div className="truncate">{c.city}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.continent}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.country}</td>
                    <td className="px-4 py-3">${c.costIndex}</td>
                    <td className="px-4 py-3">{c.internetSpeed} Mbps</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => startEdit(c)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mr-3"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      No cities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Import history</h3>
              <button
                onClick={async () => {
                  setLoadingBatches(true);
                  try {
                    const data = await fetchImportBatches();
                    setBatches(data);
                  } catch {
                    toast.error("Failed to refresh import history");
                  } finally {
                    setLoadingBatches(false);
                  }
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Refresh
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {loadingBatches ? (
                <div className="px-4 py-6 text-xs text-muted-foreground">Loading import history...</div>
              ) : batches.length === 0 ? (
                <div className="px-4 py-6 text-xs text-muted-foreground">No CSV imports recorded yet.</div>
              ) : (
                <ul className="divide-y divide-border text-xs">
                  {batches.map((b) => (
                    <li key={b.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{b.filename}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {new Date(b.createdAt).toLocaleString()} · {b.cityCount} cities
                          {b.importedByEmail ? ` · ${b.importedByEmail}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => loadBatchCities(b.id)}
                          className="px-2 py-1 rounded-md border border-border text-[11px] hover:bg-secondary"
                        >
                          View
                        </button>
                        <button
                          onClick={() => clearBatchCities(b.id)}
                          className="px-2 py-1 rounded-md border border-destructive/40 text-[11px] text-destructive hover:bg-destructive/10"
                        >
                          Delete cities
                        </button>
                        <button
                          onClick={() => removeBatch(b.id)}
                          className="px-2 py-1 rounded-md border border-border/60 text-[11px] text-muted-foreground hover:bg-secondary/60"
                        >
                          Delete history
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Batch cities {selectedBatchId ? `#${selectedBatchId}` : ""}
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {selectedBatchId == null ? (
                <div className="px-4 py-6 text-xs text-muted-foreground">Select an import to inspect its cities.</div>
              ) : loadingBatchCities ? (
                <div className="px-4 py-6 text-xs text-muted-foreground">Loading cities for this import...</div>
              ) : batchCities.length === 0 ? (
                <div className="px-4 py-6 text-xs text-muted-foreground">No cities remain for this import.</div>
              ) : (
                <ul className="divide-y divide-border text-xs">
                  {batchCities.map((c) => (
                    <li key={c.id} className="px-4 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.city}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {c.country} · {c.continent}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(c.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive hover:underline"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 glass-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deleted cities</h3>
          <button
            onClick={refreshDeleted}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Refresh
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {loadingDeleted ? (
            <div className="px-4 py-6 text-xs text-muted-foreground">Loading deleted cities...</div>
          ) : deletedCities.length === 0 ? (
            <div className="px-4 py-6 text-xs text-muted-foreground">No deleted cities in archive.</div>
          ) : (
            <ul className="divide-y divide-border text-xs">
              {deletedCities.map((d) => (
                <li key={d.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.city}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {d.country} · {d.continent} ·{" "}
                      {new Date(d.deletedAt).toLocaleString()}
                      {d.deletedByEmail ? ` · by ${d.deletedByEmail}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => restore(d.id)}
                    className="px-2 py-1 rounded-md border border-border text-[11px] hover:bg-secondary"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ControlPanelLayout>
  );
}

