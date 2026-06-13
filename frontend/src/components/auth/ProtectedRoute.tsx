import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';
import { ReactNode } from 'react';

/**
 * ProtectedRoute
 *
 * Wraps routes that require authentication. While the AuthProvider
 * is still verifying the stored token (loading=true), shows a
 * full-screen spinner to avoid a flash of the login page before
 * the user's session is restored. Once resolved, redirects to
 * /login if unauthenticated, otherwise renders the children.
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner fullScreen label="Loading your dashboard..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
