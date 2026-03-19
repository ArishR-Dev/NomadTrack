import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingDock } from "@/components/FloatingDock";
import { TopNavbar } from "@/components/TopNavbar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import ExploreCities from "./pages/ExploreCities";
import GlobalMap from "./pages/GlobalMap";
import CityDetails from "./pages/CityDetails";
import CityComparison from "./pages/CityComparison";
import Insights from "./pages/Insights";
import Favorites from "./pages/Favorites";
import SettingsPage from "./pages/SettingsPage";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ControlPanelDashboard from "./pages/control/ControlPanelDashboard";
import ControlPanelCities from "./pages/control/ControlPanelCities";
import ControlPanelUsers from "./pages/control/ControlPanelUsers";
import ControlPanelAnalytics from "./pages/control/ControlPanelAnalytics";

const queryClient = new QueryClient();

function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false);
    const timer = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`transition-all duration-300 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      {children}
    </div>
  );
}

const AppLayout = () => {
  const { isDark, toggle } = useTheme();
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const path = location.pathname;

  // Hidden internal console access: Ctrl+Shift+A navigates to /control-panel
  // Must be declared before any conditional returns to keep hook order stable.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCombo = e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a");
      if (!isCombo) return;
      // Allow only signed-in users to attempt navigation; non-admins will be redirected by route guard.
      if (!user) return;
      e.preventDefault();
      navigate("/control-panel");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in: show sign-in at /, sign-up at /signup, forgot at /forgot-password; else redirect to /
  if (!user) {
    if (path === "/" || path === "/signin") {
      return (
        <PageTransitionWrapper>
          <SignIn />
        </PageTransitionWrapper>
      );
    }
    if (path === "/signup") {
      return (
        <PageTransitionWrapper>
          <SignUp />
        </PageTransitionWrapper>
      );
    }
    if (path === "/forgot-password") {
      return (
        <PageTransitionWrapper>
          <ForgotPassword />
        </PageTransitionWrapper>
      );
    }
    if (path === "/reset-password") {
      return (
        <PageTransitionWrapper>
          <ResetPassword />
        </PageTransitionWrapper>
      );
    }
    return <Navigate to="/" replace />;
  }

  // Logged in: redirect signin/signup/reset/forgot-password to dashboard
  if (path === "/signin" || path === "/signup" || path === "/forgot-password" || path === "/reset-password") {
    return <Navigate to="/" replace />;
  }

  // Logged in: main app (Dashboard stays at /)
  return (
    <div className="flex flex-col min-h-screen w-full">
      <TopNavbar search={search} onSearchChange={setSearch} isDark={isDark} onToggleTheme={toggle} />
      <main className="flex-1 overflow-y-auto">
        <PageTransitionWrapper>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/control-panel"
              element={user?.role === "admin" ? <ControlPanelDashboard /> : <Navigate to="/" replace />}
            />
            <Route
              path="/control-panel/dashboard"
              element={user?.role === "admin" ? <ControlPanelDashboard /> : <Navigate to="/" replace />}
            />
            <Route
              path="/control-panel/cities"
              element={user?.role === "admin" ? <ControlPanelCities /> : <Navigate to="/" replace />}
            />
            <Route
              path="/control-panel/users"
              element={user?.role === "admin" ? <ControlPanelUsers /> : <Navigate to="/" replace />}
            />
            <Route
              path="/control-panel/analytics"
              element={user?.role === "admin" ? <ControlPanelAnalytics /> : <Navigate to="/" replace />}
            />
            <Route path="/explore" element={<ExploreCities />} />
            <Route path="/map" element={<GlobalMap />} />
            <Route path="/city/:id" element={<CityDetails />} />
            <Route path="/compare" element={<CityComparison />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransitionWrapper>
      </main>
      <FloatingDock />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
