import { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err: any) {
      // Still show success to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-1">We'll send you a link to reset your password</p>
        </div>

        <div className="glass-card p-6">
          {sent ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-lg font-display font-semibold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground">We've sent a password reset link to <strong className="text-foreground">{email}</strong></p>
              <Link to="/signin" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-4">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 text-sm font-medium rounded-lg gradient-primary text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        {!sent && (
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
