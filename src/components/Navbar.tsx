
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, DollarSign, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = ({ isAuthenticated = false }: { isAuthenticated?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            PayPal
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/auth"
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Profile
                </Link>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Bell className="h-5 w-5" />
                </Button>
                <Link to="/" className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && isMobile && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                    location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-gray-100'
                  }`}
                  onClick={closeMenu}
                >
                  Home
                </Link>
                <Link 
                  to="/auth"
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium transition-all hover:bg-primary/90 text-center"
                  onClick={closeMenu}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                    location.pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-gray-100'
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                    location.pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-gray-100'
                  }`}
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <Link 
                  to="/" 
                  className="text-sm font-medium px-4 py-2 rounded-md text-destructive hover:bg-destructive/10 flex items-center"
                  onClick={closeMenu}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
