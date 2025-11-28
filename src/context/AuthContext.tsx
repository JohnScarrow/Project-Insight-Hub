import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, User } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    // Use the auth endpoint which now reads bearer token
    authApi.getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('authToken');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (u: User, token?: string) => {
    setUser(u);
    if (token) {
      localStorage.setItem('authToken', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
