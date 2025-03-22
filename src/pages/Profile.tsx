import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, CreditCard, Phone, Mail, Key, Edit, Save, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { profile, updateProfile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile data state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  
  // Initialize user data from profile
  useEffect(() => {
    if (profile) {
      setUserData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        avatar: profile.avatar
      });
    }
  }, [profile]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading && !profileLoading) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, isLoading, profileLoading]);
  
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    if (user) {
      const success = await updateProfile(userData);
      if (success) {
        setIsEditing(false);
      }
    }
    
    setIsLoading(false);
  };

  if (!user || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-10 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 md:h-48"></div>
              
              <div className="px-6 md:px-10 pb-8 relative">
                <div className="flex flex-col md:flex-row items-center md:items-end md:space-x-5 -mt-12 md:-mt-16">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-md">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="mt-4 md:mt-0 text-center md:text-left flex-1">
                    <h1 className="text-2xl font-bold">{userData.name}</h1>
                    <p className="text-gray-500">{userData.email}</p>
                  </div>
                  
                  <div className="flex mt-4 md:mt-0 space-x-2">
                    <Button 
                      variant={isEditing ? "default" : "outline"} 
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          {isEditing ? (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </>
                          )}
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
                
                <div className="mt-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={userData.name}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        disabled={!isEditing || isLoading}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        disabled={!isEditing || isLoading}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        disabled={!isEditing || isLoading}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center">
                        <Key className="h-4 w-4 mr-2 text-gray-500" />
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value="••••••••"
                        disabled={true}
                        className="bg-gray-50"
                      />
                      <Button 
                        variant="link" 
                        className="text-xs p-0 h-auto flex items-center text-primary"
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-gray-500">Expires 04/25</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                    
                    <Button variant="outline" className="mt-4">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
