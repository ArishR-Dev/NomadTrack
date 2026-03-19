import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Globe, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "@/lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset link is invalid or missing.");
      return;
    }
    if (!password || !confirm) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success("Password reset successfully. You can now sign in.");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Reset failed. Your link may have expired.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const content =
    !token ? (
      <div className="text-center py-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          This reset link is invalid or has been opened without a token.
        </p>
        <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" /> Request a new link
        </Link>
      </div>
    ) : done ? (
      <div className="text-center py-4 space-y-3">
        <CheckCircle className="w-12 h-12 text-primary mx-auto" />
        <h2 className="text-lg font-display font-semibold text-foreground">Password updated</h2>
        <p className="text-sm text-muted-foreground">
          Your password has been reset. Redirecting you to sign in…
        </p>
        <Link to="/signin" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-3">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">New password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a new password"
              required
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Confirm new password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your new password"
              required
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-sm font-medium rounded-lg gradient-primary text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a strong password that you haven’t used here before.
          </p>
        </div>

        <div className="glass-card p-6">{content}</div>

        {!done && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/signin" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

