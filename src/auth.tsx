import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { errorMessage, get, http, post, type AuthMeResponse, type LoginResponse, type Role } from './api';

type AuthContextValue = { user: LoginResponse | null; initializing: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; clear: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);
let sessionRequest: Promise<AuthMeResponse | null> | null = null;

function restoreSession() {
  if (!sessionRequest) {
    sessionRequest = get<AuthMeResponse>('/auth/me')
      .catch(() => null)
      .finally(() => { sessionRequest = null; });
  }
  return sessionRequest;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [initializing, setInitializing] = useState(true);
  const queryClient = useQueryClient();
  useEffect(() => {
    const interceptor = http.interceptors.response.use(response => response, error => {
      if (error.response?.status === 401 && !String(error.config?.url).includes('/auth/login')) {
        setUser(null); queryClient.clear();
      }
      return Promise.reject(error);
    });
    return () => http.interceptors.response.eject(interceptor);
  }, [queryClient]);
  useEffect(() => {
    let active = true;
    restoreSession()
      .then(session => { if (active && session?.active) setUser({ id: session.id, name: session.name, email: session.email, role: session.role }); else if (active) setUser(null); })
      .finally(() => { if (active) setInitializing(false); });
    return () => { active = false; };
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user,
    initializing,
    login: async (email, password) => { const result = await post<LoginResponse>('/auth/login', { email, password }); setUser(result); queryClient.clear(); },
    logout: async () => { await post<void>('/auth/logout', {}); setUser(null); queryClient.clear(); },
    clear: () => { setUser(null); queryClient.clear(); },
  }), [user, initializing, queryClient]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider ausente'); return value; }
export function RequireAuth({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const { user, initializing } = useAuth(); const location = useLocation();
  if (initializing) return <div className="session-loading">Restaurando sessão…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <div className="content"><h1>Acesso indisponível</h1><p>Seu perfil não possui acesso a esta área. A autorização é verificada pelo servidor.</p></div>;
  return <>{children}</>;
}
export function useSafeMutation() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  return { error, pending, clearError: () => setError(''), run: async <T,>(operation: () => Promise<T>, onSuccess?: (value: T) => void) => {
    if (inFlight.current) return undefined;
    inFlight.current = true;
    setPending(true);
    setError('');
    try { const value = await operation(); onSuccess?.(value); return value; }
    catch (cause) { setError(errorMessage(cause)); return undefined; }
    finally { inFlight.current = false; setPending(false); }
  } };
}
