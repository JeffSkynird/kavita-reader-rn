import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AuthService } from '@/features/auth/services/auth-service';
import type {
  LoginPayload,
  SessionState,
  SessionStatus,
} from '@/features/auth/types';

type SessionContextValue = {
  session: SessionState | null;
  status: SessionStatus;
  signIn: (payload: LoginPayload) => Promise<SessionState>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    let isMounted = true;

    const loadStoredSession = async () => {
      // TODO: Hydrate from secure storage when deployed.
      // TODO: 
      if (!isMounted) {
        return;
      }

      setStatus(session ? 'authenticated' : 'anonymous');
    };

    loadStoredSession();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      setStatus('authenticating');

      try {
        const result = await AuthService.authenticateWithApiKey(payload);
        const nextSession: SessionState = {
          host: payload.host.trim(),
          baseUrl: result.baseUrl,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt,
          username: result.username,
          apiKey: result.apiKey ?? payload.apiKey,
        };

        setSession(nextSession);
        setStatus('authenticated');

        return nextSession;
      } catch (error) {
        setStatus(session ? 'authenticated' : 'anonymous');
        throw error;
      }
    },
    [session],
  );

  const signOut = useCallback(async () => {
    // TODO: Clean up persistent storage when deployed.
    setSession(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({
      session,
      status,
      signIn,
      signOut,
    }),
    [session, status, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }

  return context;
}
