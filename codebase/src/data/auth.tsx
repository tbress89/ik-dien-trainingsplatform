import type { User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthValue {
  /** Whether accounts are available at all (feature flag on and Supabase configured). */
  enabled: boolean;
  user: User | null;
  status: AuthStatus;
  /** Mails a login link; creates the account on first use. */
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Removes the account and everything stored with it, then signs out. */
  deleteAccount: () => Promise<void>;
}

const noAccounts = async () => {
  throw new Error('Accounts are not available');
};

const DISABLED: AuthValue = { enabled: false, user: null, status: 'signedOut', sendMagicLink: noAccounts, signOut: async () => {}, deleteAccount: noAccounts };

const AuthContext = createContext<AuthValue>(DISABLED);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(supabase ? 'loading' : 'signedOut');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const apply = (u: User | null) => {
      if (!active) return;
      setUser((prev) => (prev?.id === u?.id ? (prev ?? u) : u));
      setStatus(u ? 'signedIn' : 'signedOut');
    };
    // With PKCE and detectSessionInUrl the client exchanges the ?code= of a login link by itself; getSession
    // resolves once that is done.
    void supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    if (!supabase) return noAccounts();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}account` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    // Revokes the session everywhere; offline that fails, so fall back to forgetting it on this device only.
    const { error } = await supabase.auth.signOut();
    if (error) await supabase.auth.signOut({ scope: 'local' });
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!supabase) return noAccounts();
    const { error } = await supabase.rpc('delete_account');
    if (error) throw error;
    await supabase.auth.signOut({ scope: 'local' });
  }, []);

  const value = useMemo(() => ({ enabled: supabase !== null, user, status, sendMagicLink, signOut, deleteAccount }), [user, status, sendMagicLink, signOut, deleteAccount]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
