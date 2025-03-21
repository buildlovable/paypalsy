
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Smartphone, Lock } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft animation-delay-1000"></div>
      </div>
      
      <div className={`max-w-4xl mx-auto text-center transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="inline-flex items-center px-3 py-1 mb-8 text-sm font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-100">
          <span className="mr-1">Simple, Secure Money Transfers</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
          Send Money to Anyone, Anywhere, Anytime
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          The easiest way to send, spend, and receive money with friends and family—without the fees or hassle.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20">
          <Button 
            className="px-6 py-6 text-lg bg-primary hover:bg-primary/90 text-white transition-all shadow-lg hover:shadow-xl group"
            onClick={() => navigate('/auth')}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="outline" 
            className="px-6 py-6 text-lg border-2 shadow hover:shadow-md transition-all"
          >
            How It Works
          </Button>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="w-full max-w-6xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="glass-card rounded-2xl p-6 transition-all hover:scale-105 stagger-item">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-5">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Transfers</h3>
            <p className="text-gray-600">Send and receive money instantly between friends, family, and businesses.</p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 transition-all hover:scale-105 stagger-item">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-5">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
            <p className="text-gray-600">Your financial data is protected with advanced encryption and security measures.</p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 transition-all hover:scale-105 stagger-item">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
            <p className="text-gray-600">Pay anyone, anywhere using our beautifully designed, easy-to-use app.</p>
          </div>
        </div>
      </div>
      
      {/* App Mockup */}
      <div className="relative w-full max-w-md mx-auto mb-20 stagger-item">
        <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">PayPal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold">$1,248.00</div>
              <div className="text-sm text-gray-500">Current Balance</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="bg-blue-500 text-white py-3 rounded-lg flex items-center justify-center space-x-2">
                <ArrowUpRight className="w-4 h-4" />
                <span>Send</span>
              </button>
              <button className="bg-white border border-gray-200 py-3 rounded-lg flex items-center justify-center space-x-2">
                <ArrowDownLeft className="w-4 h-4" />
                <span>Request</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                  <div className="text-red-500 font-medium">- $24.00</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                      <div className="font-medium">Sarah Smith</div>
                      <div className="text-xs text-gray-500">Yesterday</div>
                    </div>
                  </div>
                  <div className="text-green-500 font-medium">+ $45.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-100 transform rotate-3 rounded-xl -z-10"></div>
      </div>
    </div>
  );
};

// Explicitly import these to make sure they're available in the component
import { ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';

export default Hero;
