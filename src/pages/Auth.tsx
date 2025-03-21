
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';
import { useEffect } from 'react';

const Auth = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex flex-1 items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;
