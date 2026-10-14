import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { signJWT, verifyJWT } from '../utils/jwt';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'usr-default',
  name: 'Juan Pérez',
  email: 'juan.perez@correo.com',
  role: 'seeker',
  phone: '+57 300 123 4567',
  city: 'Bogotá',
  avatarColor: '#2563EB'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializar o verificar JWT desde localStorage
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('oy-auth-token');
        const storedUser = localStorage.getItem('oy-user-data');

        if (storedToken && storedUser) {
          const payload = await verifyJWT<User>(storedToken);
          if (payload) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Error verificando sesión JWT:', err);
        logout();
      } finally {
        setTimeout(() => setIsLoading(false), 550);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setIsLoading(true);
    const existing = user && user.email === email ? user : { ...DEFAULT_USER, email };
    const newToken = await signJWT({
      id: existing.id,
      email: existing.email,
      role: existing.role,
      name: existing.name
    });
    setUser(existing);
    setToken(newToken);
    localStorage.setItem('oy-auth-token', newToken);
    localStorage.setItem('oy-user-data', JSON.stringify(existing));
    setTimeout(() => setIsLoading(false), 400);
    return true;
  };

  const register = async (name: string, email: string, _pass: string, initialRole: UserRole = 'seeker'): Promise<boolean> => {
    setIsLoading(true);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: initialRole,
      phone: '+57 300 000 0000',
      city: 'Bogotá',
      avatarColor: initialRole === 'seeker' ? '#2563EB' : '#EA580C'
    };

    const newToken = await signJWT({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('oy-auth-token', newToken);
    localStorage.setItem('oy-user-data', JSON.stringify(newUser));
    setTimeout(() => setIsLoading(false), 400);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('oy-auth-token');
    localStorage.removeItem('oy-user-data');
    setUser(null);
    setToken(null);
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    const newToken = await signJWT({
      id: updated.id,
      email: updated.email,
      role: updated.role,
      name: updated.name
    });
    setToken(newToken);
    localStorage.setItem('oy-auth-token', newToken);
    localStorage.setItem('oy-user-data', JSON.stringify(updated));
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('oy-user-data', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'seeker',
        token,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
