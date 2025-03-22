
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from "@/components/ui/progress";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showLoadingState, setShowLoadingState] = useState(true);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // If already authenticated, redirect immediately
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    
    // Show form after a shorter timeout (500ms) to prevent long loading states
    const timer = setTimeout(() => {
      setShowLoadingState(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  // Only show loading state if explicitly loading AND we haven't timed out
  const shouldShowLoading = isLoading && showLoadingState;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex flex-1 items-center justify-center px-4">
        {shouldShowLoading ? (
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium">Loading your profile...</h2>
              <p className="text-gray-500 mt-2">This will only take a moment...</p>
            </div>
            <Progress value={75} className="w-full" />
            <p className="text-xs text-gray-400 text-center mt-4">
              If this takes too long, try refreshing the page
            </p>
          </div>
        ) : (
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-600">Enter your credentials to access your account</p>
            </div>
            <AuthForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
