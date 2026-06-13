import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/axiosClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider
 *
 * Wraps the app and provides authentication state + actions globally.
 *
 * On mount, if a token exists in localStorage, it fetches the current
 * user profile (/auth/me) to verify the token is still valid and to
 * hydrate user data (e.g., after a page refresh). This avoids storing
 * the full user object as the source of truth - the token + a fresh
 * fetch is always authoritative.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authApi.getMe();
        setUser(data.data);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { data } = await authApi.register({ name, email, password });
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context. Throws if used outside AuthProvider,
 * which helps catch misuse early during development.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
