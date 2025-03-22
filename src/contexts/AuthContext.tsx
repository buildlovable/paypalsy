
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { AuthFormData, User as AppUser, mapSupabaseUser } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/base';
import { fetchUserProfile } from '@/services/api';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthFormData) => Promise<void>;
  signup: (data: AuthFormData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Update user profile data when session changes
  const updateUserData = async (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }
    
    try {
      const profileData = await fetchUserProfile(supabaseUser.id);
      if (profileData) {
        setUser(profileData);
      } else {
        // Fallback if profile not found
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata.name || supabaseUser.email?.split('@')[0] || '',
          avatar: '',
          balance: 0
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Still set isLoading to false even if there's an error
      setIsLoading(false);
    }
  };

  // Set up auth state listener and check for existing session
  useEffect(() => {
    let isMounted = true;
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        try {
          await updateUserData(currentSession?.user ?? null);
        } finally {
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setSession(currentSession);
        await updateUserData(currentSession?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (data: AuthFormData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login failed:', authError);
      toast.error(authError.message || 'Login failed. Please check your credentials.');
      throw error; // Rethrow to handle in form component
    }
  };

  const signup = async (data: AuthFormData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || data.email.split('@')[0],
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Signup failed:', authError);
      toast.error(authError.message || 'Failed to create account. Please try again.');
      throw error; // Rethrow to handle in form component
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
