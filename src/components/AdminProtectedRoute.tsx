import { Navigate } from 'react-router';
import type { ReactNode } from 'react';
import { useAdminAuthStore } from '../store/useAdminAuthStore';

export default function AdminProtectedRoute({ children }: { children: ReactNode }) {
    const { isAdminLoggedIn } = useAdminAuthStore();

    if (!isAdminLoggedIn) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}