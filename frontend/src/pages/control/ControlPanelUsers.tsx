import { useEffect, useMemo, useState } from "react";
import { ControlPanelLayout } from "@/pages/control/ControlPanelLayout";
import { deleteConsoleUser, fetchConsoleUserFavorites, fetchConsoleUsers, type ControlConsoleUser } from "@/lib/api";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";

interface FavoriteCity {
  id: number;
  city: string;
  country: string;
  image: string;
  city_id?: number;
}

export default function ControlPanelUsers() {
  const [users, setUsers] = useState<ControlConsoleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ControlConsoleUser | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCity[] | null>(null);
  const [loadingFavs, setLoadingFavs] = useState(false);

  useEffect(() => {
    fetchConsoleUsers()
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q));
  }, [users, query]);

  const loadFavorites = async (u: ControlConsoleUser) => {
    setSelectedUser(u);
    setLoadingFavs(true);
    setFavorites(null);
    try {
      const favs = await fetchConsoleUserFavorites(u.id);
      setFavorites(favs as any);
    } catch {
      toast.error("Failed to load favorites");
    } finally {
      setLoadingFavs(false);
    }
  };

  const removeUser = async (u: ControlConsoleUser) => {
    if (!confirm(`Delete user "${u.email}"? This will remove their favorites as well.`)) return;
    try {
      await deleteConsoleUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      if (selectedUser?.id === u.id) {
        setSelectedUser(null);
        setFavorites(null);
      }
      toast.success("User deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <ControlPanelLayout title="Platform Console" subtitle="User management and saved items inspection">
      <div className="glass-card p-4 mb-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="px-3 py-2 text-sm bg-secondary border border-border rounded-lg outline-none w-[260px] max-w-full"
          />
          <span className="text-xs text-muted-foreground">{loading ? "Loading..." : `${filtered.length} users`}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-display font-semibold">Users</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select a user to view their saved cities</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => loadFavorites(u)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mr-3"
                      >
                        <Heart className="w-3.5 h-3.5" /> Favorites
                      </button>
                      <button
                        onClick={() => removeUser(u)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-display font-semibold">Saved cities</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedUser ? `User: ${selectedUser.email}` : "Select a user to view favorites"}
            </p>
          </div>
          <div className="p-4">
            {loadingFavs ? (
              <p className="text-sm text-muted-foreground">Loading favorites...</p>
            ) : favorites && favorites.length ? (
              <div className="space-y-2">
                {favorites.map((c) => (
                  <div key={c.city_id ?? c.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 border border-border">
                    <img src={c.image} alt={c.city} className="w-10 h-10 rounded-lg object-cover border border-border" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.city}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No favorites to show.</p>
            )}
          </div>
        </div>
      </div>
    </ControlPanelLayout>
  );
}

