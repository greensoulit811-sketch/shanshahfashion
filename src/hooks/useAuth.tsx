import { useState, useEffect, createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TIMEOUT_MS = 8000; // 8 seconds max wait

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const initRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('is_admin', { _user_id: userId });
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return data as boolean;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  const finishLoading = () => {
    setIsLoading(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (initRef.current) return;
    initRef.current = true;

    // Safety timeout - never let the app hang forever
    timeoutRef.current = window.setTimeout(() => {
      console.warn('Auth initialization timed out, proceeding without auth');
      setAuthError('Auth initialization timed out');
      finishLoading();
    }, AUTH_TIMEOUT_MS);

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Check admin role - use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            try {
              const adminStatus = await checkAdminRole(newSession.user.id);
              setIsAdmin(adminStatus);
            } catch (error) {
              console.error('Failed to check admin role:', error);
              setIsAdmin(false);
            }
            finishLoading();
          }, 0);
        } else {
          setIsAdmin(false);
          finishLoading();
        }
      }
    );

    // Get the current session
    supabase.auth.getSession()
      .then(async ({ data: { session: currentSession }, error }) => {
        if (error) {
          console.error('Error getting session:', error);
          setAuthError(error.message);
          finishLoading();
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          try {
            const adminStatus = await checkAdminRole(currentSession.user.id);
            setIsAdmin(adminStatus);
          } catch (error) {
            console.error('Failed to check admin role:', error);
            setIsAdmin(false);
          }
        }
        
        finishLoading();
      })
      .catch((error) => {
        console.error('Auth getSession failed:', error);
        setAuthError('Failed to initialize auth');
        finishLoading();
      });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
    }
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setAuthError(error.message);
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    setAuthError(null);
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        authError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
