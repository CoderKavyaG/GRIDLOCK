import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col items-center justify-center gap-6">
        <div className="font-syne text-[28px] font-black text-white tracking-tight">GRIDLOCK<span className="text-[var(--accent)]">.</span></div>
        <div className="w-8 h-8 border-[3px] border-[#2a2a2a] border-t-[var(--accent)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  // Support both children prop (direct usage) and Outlet (nested route usage)
  return children ?? <Outlet />;
}
