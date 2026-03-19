import { useState, useEffect } from "react";
import { Camera, Mail, MapPin, Lock, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, getToken } from "@/lib/apiClient";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const name = user?.name || "Nomad User";
  const email = user?.email || "nomad@track.io";
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    apiFetch<{ user: { bio?: string; location?: string } }>("/api/auth/me")
      .then(data => {
        setBio(data.user.bio || "");
        setLocation(data.user.location || "");
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ bio, location }),
      });
      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container pb-24">
      <div>
        <h1 className="section-title">Profile</h1>
        <p className="section-subtitle">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg font-display font-bold text-foreground mt-4">{name}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          {location && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </div>
          )}
          {bio && (
            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">{bio}</p>
          )}
        </div>

        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-semibold text-foreground">Personal Information</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                Edit
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-foreground gradient-primary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-4 first:pt-0">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{name}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">{email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="w-full">
                <p className="text-xs text-muted-foreground">Location</p>
                {editing ? (
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bali, Indonesia"
                    className="mt-1 w-full px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground" />
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{location || "Not set"}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="py-4">
              <div className="w-full">
                <p className="text-xs text-muted-foreground">Bio</p>
                {editing ? (
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3}
                    className="mt-1 w-full px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground resize-none" />
                ) : (
                  <p className="text-sm font-medium text-foreground mt-0.5">{bio || "Not set"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-4 last:pb-0">
              <div>
                <p className="text-xs text-muted-foreground">Password</p>
                <p className="text-sm font-medium text-foreground mt-0.5">••••••••</p>
              </div>
              <Link to="/forgot-password" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                <Lock className="w-3.5 h-3.5" />
                Reset Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
