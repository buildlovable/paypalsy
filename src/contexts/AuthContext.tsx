
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { AuthFormData, User as AppUser, mapSupabaseUser } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from '@/services/api';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthFormData) => Promise<void>;
  signup: (data: AuthFormData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const updateUserData = async (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const profileData = await fetchUserProfile(supabaseUser.id);
      if (profileData) {
        setUser(profileData);
      } else {
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        console.log('Auth state changed:', event, !!currentSession);
        
        setSession(currentSession);
        
        if (!currentSession) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Use setTimeout to defer the async operation as recommended in Supabase docs
        setTimeout(async () => {
          try {
            if (isMounted) {
              await updateUserData(currentSession?.user ?? null);
            }
          } catch (error) {
            console.error('Error updating user data:', error);
            if (isMounted) {
              setIsLoading(false);
            }
          }
        }, 0);
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Got initial session:', !!currentSession);
        
        if (!isMounted) return;
        
        setSession(currentSession);
        
        if (!currentSession) {
          setIsLoading(false);
          return;
        }
        
        await updateUserData(currentSession?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('Cleaning up auth state listener');
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
      throw error;
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
      throw error;
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

  const forgotPassword = async (email: string) => {
    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth?reset=true`;
      
      console.log(`Sending password reset to ${email} with redirect to ${redirectTo}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset link sent to your email');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Password reset failed:', authError);
      toast.error(authError.message || 'Failed to send password reset email. Please try again.');
      throw error;
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('Password updated successfully');
      navigate('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Password update failed:', authError);
      toast.error(authError.message || 'Failed to update password. Please try again.');
      throw error;
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
        forgotPassword,
        resetPassword,
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
