import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserMode } from '@/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, mode: UserMode) => Promise<{ error: string | null; needsEmailVerification: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveUserMode(session: Session | null): UserMode {
  return session?.user.user_metadata?.mode === 'agent' ? 'agent' : 'applicant';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .finally(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const firstSegment = segments[0];
    const inAuthGroup = firstSegment === '(auth)';

    if (!session && firstSegment && !inAuthGroup) {
      router.replace('/(auth)/welcome?mode=applicant');
      return;
    }

    if (session && inAuthGroup) {
      const mode = resolveUserMode(session);
      router.replace(mode === 'agent' ? '/(agent)/dashboard' : '/(applicant)/dashboard');
    }
  }, [loading, router, segments, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        return { error: error?.message ?? null };
      },
      signUp: async (email: string, password: string, mode: UserMode) => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { mode },
          },
        });

        const needsEmailVerification = !data.session;
        return {
          error: error?.message ?? null,
          needsEmailVerification,
        };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
