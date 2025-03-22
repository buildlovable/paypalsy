
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from "@/components/ui/progress";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, isLoading]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex flex-1 items-center justify-center px-4">
        {isLoading ? (
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium">Loading your profile...</h2>
            </div>
            <Progress value={75} className="w-full" />
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
