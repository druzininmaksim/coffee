import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading, isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="px-4 py-8 text-center text-amber-50/70">Проверяем доступ…</div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
