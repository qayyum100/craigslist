import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface Props {
    children: React.ReactNode;
    redirectTo?: string;
}

export const ProtectedRoute = ({ children, redirectTo = '/login' }: Props) => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
