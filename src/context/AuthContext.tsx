import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usersApi, authApi, User } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (!storedId) {
      setLoading(false);
      return;
    }

    // Use the auth endpoint which reads `x-user-id` header for POC auth
    authApi.getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('userId');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('userId', u.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
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
