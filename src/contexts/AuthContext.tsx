import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { getSupabase } from '../lib/supabase';
import { fetchProfile, updateProfile, extractNameFromEmail } from '../lib/storage';

export interface AuthUser {
  id: string;
  email: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ success: boolean; error?: string; requireVerification?: boolean }>;
  loginWithDemo: (demoEmail?: string) => Promise<{ success: boolean; error?: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (val: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_SESSION_KEY = 'ds_focus_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.hash.includes('type=recovery') ||
        window.location.search.includes('type=recovery')
      );
    }
    return false;
  });

  // Restore session on launch
  useEffect(() => {
    async function initSession() {
      setIsLoading(true);
      const supabase = getSupabase();

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              isDemo: false,
            };
            setUser(authUser);
            const prof = await fetchProfile(
              authUser.id,
              authUser.email,
              session.user.user_metadata?.full_name
            );
            setProfile(prof);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
        }
      }

      // Check local session
      try {
        const raw = localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AuthUser;
          // Only maintain session if explicitly marked as demo or if supabase client is offline
          if (parsed && parsed.id && parsed.isDemo) {
            setUser(parsed);
            const prof = await fetchProfile(parsed.id, parsed.email);
            setProfile(prof);
          } else {
            // Unauthenticated in Supabase Cloud -> clear stale session so user can log in with a fresh token
            localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Failed reading local auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();

    // Listen to Supabase auth state change
    const supabase = getSupabase();
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            isDemo: false,
          };
          setUser(authUser);
          try {
            localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(authUser));
          } catch {}
          const prof = await fetchProfile(
            authUser.id,
            authUser.email,
            session.user.user_metadata?.full_name
          );
          setProfile(prof);
        } else if (event === 'SIGNED_OUT') {
          try {
            localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
          } catch {}
          setUser(null);
          setProfile(null);
          setIsPasswordRecovery(false);
        }
      });

      return () => {
        data?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Login with Gmail / Email & Password
  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          if (
            error.message?.toLowerCase().includes('disabled') ||
            (error as { code?: string })?.code === 'email_provider_disabled'
          ) {
            return {
              success: false,
              error:
                'Email logins are disabled in your Supabase project. Go to Supabase Dashboard > Authentication > Providers > Email, turn ON "Enable Email provider" and click Save.',
            };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            isDemo: false,
          };
          setUser(authUser);
          try {
            localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(authUser));
          } catch {}

          const prof = await fetchProfile(
            authUser.id,
            authUser.email,
            data.user.user_metadata?.full_name
          );
          setProfile(prof);
          return { success: true };
        }
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Login failed with Supabase.',
        };
      }
    }

    // Fallback sandbox login
    return loginWithDemo(cleanEmail);
  };

  // Sign up with Gmail / Email & Password
  const signupWithEmail = async (
    email: string,
    password: string,
    fullName = ''
  ): Promise<{ success: boolean; error?: string; requireVerification?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const effectiveName = fullName.trim() || extractNameFromEmail(cleanEmail);
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: effectiveName,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (
            error.message?.toLowerCase().includes('disabled') ||
            (error as { code?: string })?.code === 'email_provider_disabled'
          ) {
            return {
              success: false,
              error:
                'Email signups are disabled in your Supabase project. Go to Supabase Dashboard > Authentication > Providers > Email, turn ON "Enable Email provider" and click Save.',
            };
          }
          if (error.message?.toLowerCase().includes('rate limit')) {
            return {
              success: false,
              error:
                'Supabase email rate limit exceeded (3 emails/hr). Please disable "Confirm email" in Supabase Dashboard (Authentication > Providers > Email) for instant zero-friction signups, or try again in a few minutes.',
            };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          if (data.session) {
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              isDemo: false,
            };
            setUser(authUser);
            try {
              localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(authUser));
            } catch {}

            const prof = await fetchProfile(authUser.id, authUser.email, effectiveName);
            setProfile(prof);
            return { success: true };
          } else {
            return {
              success: true,
              requireVerification: true,
            };
          }
        }
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Signup failed with Supabase.',
        };
      }
    }

    // Fallback sandbox
    return loginWithDemo(cleanEmail);
  };

  // 1-Click Instant Demo Login
  const loginWithDemo = async (
    demoEmail = 'demo@sash.com'
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = demoEmail.trim().toLowerCase();
    const cleanId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(-12).padStart(12, '0');
    const demoUserId = `00000000-0000-0000-0000-${cleanId}`;

    const authUser: AuthUser = {
      id: demoUserId,
      email: cleanEmail,
      isDemo: true,
    };

    setUser(authUser);
    try {
      localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(authUser));
    } catch {}

    const prof = await fetchProfile(
      demoUserId,
      cleanEmail,
      cleanEmail.includes('demo') ? 'Demo User' : extractNameFromEmail(cleanEmail)
    );
    setProfile(prof);

    return { success: true };
  };

  // Resend signup confirmation email
  const resendConfirmationEmail = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to resend confirmation email.',
      };
    }
  };

  // Send password reset email
  const resetPasswordForEmail = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabase();

    if (supabase) {
      try {
        const redirectTo = `${window.location.origin}/`;
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo,
        });

        if (error) {
          if (error.message?.toLowerCase().includes('rate limit')) {
            return {
              success: false,
              error: 'Supabase email rate limit reached (3 emails/hr). Please wait a few minutes or configure custom SMTP in Supabase Settings.',
            };
          }
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to send password reset email.',
        };
      }
    }

    // Fallback sandbox / demo mode
    return { success: true };
  };

  // Update user's password (e.g. from recovery flow or settings)
  const updateUserPassword = async (
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }
        setIsPasswordRecovery(false);
        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update password.',
        };
      }
    }

    setIsPasswordRecovery(false);
    return { success: true };
  };

  // Update profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await updateProfile(user.id, updates);
    setProfile(updated);
  };

  // Logout
  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout failed:', err);
      }
    }

    try {
      localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
    } catch {}
    setUser(null);
    setProfile(null);
    setIsPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        loginWithEmail,
        signupWithEmail,
        loginWithDemo,
        resendConfirmationEmail,
        resetPasswordForEmail,
        updateUserPassword,
        isPasswordRecovery,
        setIsPasswordRecovery,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
