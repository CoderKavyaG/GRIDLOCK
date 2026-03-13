import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PageSkeleton from "./PageSkeleton";

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      addToast("Access denied. Administrator privileges required.", "error");
    }
  }, [loading, user, isAdmin, addToast]);

  if (loading) return <PageSkeleton />;

  if (!user) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
