
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthFormData } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthFormData) => Promise<void>;
  signup: (data: AuthFormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to your backend
      const mockApiCall = () => {
        return new Promise<User>((resolve) => {
          setTimeout(() => {
            // Simulate fetching user from database
            resolve({
              id: 'usr_' + Math.random().toString(36).substring(2, 9),
              name: data.email.split('@')[0],
              email: data.email,
              avatar: '',
              balance: 1000,
            });
          }, 1000);
        });
      };

      const userData = await mockApiCall();
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to your backend
      const mockApiCall = () => {
        return new Promise<User>((resolve) => {
          setTimeout(() => {
            // Simulate creating user in database
            resolve({
              id: 'usr_' + Math.random().toString(36).substring(2, 9),
              name: data.name || data.email.split('@')[0],
              email: data.email,
              avatar: '',
              balance: 500, // Starting balance for new users
            });
          }, 1000);
        });
      };

      const userData = await mockApiCall();
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
