import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { signJWT, verifyJWT } from '../utils/jwt';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  /** OFY-50: valida correo + contraseña contra las cuentas registradas (`oy-users`). */
  login: (email: string, pass: string) => Promise<boolean>;
  /** Devuelve false si el correo ya tiene una cuenta activa. */
  register: (name: string, email: string, pass: string, role?: UserRole, extra?: Partial<User>) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  /** Busca una cuenta activa por correo o celular (recuperación OFY-75). */
  findAccount: (emailOrPhone: string) => User | null;
  /** OFY-75: reemplaza la contraseña de la cuenta con ese correo. */
  resetPassword: (email: string, newPass: string) => Promise<boolean>;
  /** OFY-DEMO: Selector rápido para la feria de proyectos DOSW (Don Carlos, Seeker, Invitado). */
  loginAsDemo: (target: 'carlos' | 'seeker' | 'guest') => Promise<void>;
}

/** Registro persistido de cuentas (mock del backend). */
interface StoredAccount {
  user: User;
  passwordHash: string;
}

const USERS_KEY = 'oy-users';
const DEMO_PASSWORD = 'demo123';

const DEFAULT_USER: User = {
  id: 'usr-default',
  name: 'Juan Pérez',
  email: 'juan.perez@correo.com',
  role: 'seeker',
  phone: '+57 300 123 4567',
  city: 'Bogotá',
  avatarColor: 'var(--oy-azul-marino)'
};

export const CARLOS_DEMO_USER: User = {
  id: 'usr-carlos-demo',
  name: 'Don Carlos Mendoza',
  email: 'carlos.mendoza@oficioya.com',
  role: 'provider',
  phone: '+57 301 776 5432',
  city: 'Bogotá',
  avatarColor: 'var(--oy-naranja-many)',
  phoneVerified: true,
  emailVerified: true
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizePhone = (phone: string) => phone.replace(/\D/g, '').replace(/^57(?=\d{10}$)/, '');

/** Hash SHA-256 (Web Crypto) con sal por correo; respaldo simple si no hay contexto seguro. */
async function hashPassword(email: string, pass: string): Promise<string> {
  const input = `oficioya:${normalizeEmail(email)}:${pass}`;
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return `djb2-${(h >>> 0).toString(16)}`;
}

function readAccounts(): StoredAccount[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return Array.isArray(parsed) ? (parsed as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
  } catch {
    /* almacenamiento lleno o bloqueado: la sesión sigue en memoria */
  }
}

/** Garantiza que las cuentas demo existan (contraseña `demo123`). */
async function ensureDemoAccount(): Promise<StoredAccount[]> {
  const accounts = readAccounts();
  let updated = accounts;
  if (!updated.some(a => normalizeEmail(a.user.email) === DEFAULT_USER.email)) {
    updated = [...updated, { user: DEFAULT_USER, passwordHash: await hashPassword(DEFAULT_USER.email, DEMO_PASSWORD) }];
  }
  if (!updated.some(a => normalizeEmail(a.user.email) === CARLOS_DEMO_USER.email)) {
    updated = [...updated, { user: CARLOS_DEMO_USER, passwordHash: await hashPassword(CARLOS_DEMO_USER.email, DEMO_PASSWORD) }];
  }
  writeAccounts(updated);
  return updated;
}

/** Copia los cambios del usuario en sesión a su registro en `oy-users`. */
function syncAccount(updated: User) {
  const accounts = readAccounts();
  const idx = accounts.findIndex(a => a.user.id === updated.id);
  if (idx === -1) return;
  accounts[idx] = { ...accounts[idx], user: updated };
  writeAccounts(accounts);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('oy-auth-token');
    localStorage.removeItem('oy-user-data');
    setUser(null);
    setToken(null);
  }, []);

  // Inicializar o verificar JWT desde localStorage
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        await ensureDemoAccount();
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
      } catch {
        logout();
      } finally {
        setTimeout(() => setIsLoading(false), 550);
      }
    }

    initAuth();
  }, [logout]);

  const startSession = async (sessionUser: User) => {
    const newToken = await signJWT({
      id: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.role,
      name: sessionUser.name
    });
    setUser(sessionUser);
    setToken(newToken);
    localStorage.setItem('oy-auth-token', newToken);
    localStorage.setItem('oy-user-data', JSON.stringify(sessionUser));
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    const accounts = await ensureDemoAccount();
    const account = accounts.find(a => normalizeEmail(a.user.email) === normalizeEmail(email) && !a.user.isDeleted);
    if (!account) return false;
    if (account.passwordHash !== (await hashPassword(account.user.email, pass))) return false;

    setIsLoading(true);
    await startSession(account.user);
    setTimeout(() => setIsLoading(false), 400);
    return true;
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    initialRole: UserRole = 'seeker',
    extra: Partial<User> = {}
  ): Promise<boolean> => {
    const accounts = await ensureDemoAccount();
    if (accounts.some(a => normalizeEmail(a.user.email) === normalizeEmail(email) && !a.user.isDeleted)) {
      return false;
    }

    setIsLoading(true);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim(),
      role: initialRole,
      phone: '+57 300 000 0000',
      city: 'Bogotá',
      avatarColor: initialRole === 'seeker' ? 'var(--oy-azul-marino)' : 'var(--oy-naranja-fuego-aa)',
      ...extra
    };

    writeAccounts([
      ...accounts.filter(a => normalizeEmail(a.user.email) !== normalizeEmail(email)),
      { user: newUser, passwordHash: await hashPassword(newUser.email, pass) }
    ]);
    await startSession(newUser);
    setTimeout(() => setIsLoading(false), 400);
    return true;
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    syncAccount(updated);
    await startSession(updated);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    syncAccount(updated);
    try {
      localStorage.setItem('oy-user-data', JSON.stringify(updated));
    } catch {
      /* p. ej. foto demasiado grande para el almacenamiento local */
    }
  };

  const findAccount = (emailOrPhone: string): User | null => {
    const target = emailOrPhone.trim();
    if (!target) return null;
    const byEmail = target.includes('@');
    const phoneDigits = normalizePhone(target);
    const found = readAccounts().find(a => {
      if (a.user.isDeleted) return false;
      if (byEmail) return normalizeEmail(a.user.email) === normalizeEmail(target);
      return Boolean(a.user.phone) && phoneDigits.length >= 7 && normalizePhone(a.user.phone!) === phoneDigits;
    });
    return found ? found.user : null;
  };

  const resetPassword = async (email: string, newPass: string): Promise<boolean> => {
    const accounts = await ensureDemoAccount();
    const idx = accounts.findIndex(a => normalizeEmail(a.user.email) === normalizeEmail(email) && !a.user.isDeleted);
    if (idx === -1) return false;
    accounts[idx] = { ...accounts[idx], passwordHash: await hashPassword(accounts[idx].user.email, newPass) };
    writeAccounts(accounts);
    return true;
  };

  const loginAsDemo = async (target: 'carlos' | 'seeker' | 'guest') => {
    if (target === 'guest') {
      logout();
      return;
    }
    const targetUser = target === 'carlos' ? CARLOS_DEMO_USER : DEFAULT_USER;
    setIsLoading(true);
    await startSession(targetUser);
    setTimeout(() => setIsLoading(false), 300);
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
        updateUserProfile,
        findAccount,
        resetPassword,
        loginAsDemo
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
