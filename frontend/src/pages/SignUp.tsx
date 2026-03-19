import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/apiClient";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["", "bg-destructive", "bg-chart-orange", "bg-primary"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start exploring the best cities for nomads</p>
        </div>

        <div className="glass-card p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-secondary border border-border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthColors[strength] : "bg-border"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 text-sm font-medium rounded-lg gradient-primary text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <a
              href={`${API_BASE_URL}/api/auth/google`}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-secondary transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </a>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
