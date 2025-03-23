
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Transaction } from '@/lib/types';
import TransactionCard from '@/components/TransactionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SendMoneyForm from '@/components/SendMoneyForm';
import RequestMoneyForm from '@/components/RequestMoneyForm';
import UserAvatar from '@/components/UserAvatar';
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('transactions');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 3;
  
  // Get current transactions for pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, authLoading]);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Calculate monthly totals for sent and received
  const calculateMonthlySent = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transDate = new Date(t.date);
        return t.type === 'payment' && 
               t.sender.id === user?.id && 
               transDate.getMonth() === currentMonth &&
               transDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };
  
  const calculateMonthlyReceived = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transDate = new Date(t.date);
        return t.type === 'payment' && 
               t.recipient.id === user?.id && 
               transDate.getMonth() === currentMonth &&
               transDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (authLoading || transactionsLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="pt-20 pb-10 flex-1 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <p className="text-gray-500 mb-2">Loading your dashboard...</p>
            <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-10 flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - User Info & Balance */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={user} size="lg" />
                    <div>
                      <h2 className="font-bold text-xl">{user.name}</h2>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                    <h3 className="text-2xl font-bold">${user.balance.toFixed(2)}</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button variant="outline" className="flex items-center justify-center py-5 bg-white">
                    <Wallet className="h-4 w-4 mr-2" />
                    Add Money
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center py-5 bg-white">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Link Card
                  </Button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 shadow-md text-white">
                <h3 className="text-lg font-semibold mb-2">Refer a Friend</h3>
                <p className="text-blue-100 mb-4">Invite friends and earn $5 when they sign up and make their first transaction.</p>
                <Button className="w-full bg-white text-blue-600 hover:bg-white/90">
                  Invite Friends
                </Button>
              </div>
            </div>
            
            {/* Right Column - Transactions & Send/Request Money */}
            <div className="md:col-span-2 space-y-6">
              <Tabs 
                defaultValue="transactions"
                onValueChange={setActiveTab}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <TabsList className="w-full rounded-t-xl border-b border-gray-100 p-0">
                  <TabsTrigger
                    value="transactions"
                    className="flex-1 py-4 rounded-none rounded-tl-xl data-[state=active]:bg-white data-[state=active]:shadow-none"
                  >
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger
                    value="send"
                    className="flex-1 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none"
                  >
                    Send Money
                  </TabsTrigger>
                  <TabsTrigger
                    value="request"
                    className="flex-1 py-4 rounded-none rounded-tr-xl data-[state=active]:bg-white data-[state=active]:shadow-none"
                  >
                    Request Money
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="transactions" className="p-6 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Recent Activity</h2>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="h-8 w-8"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-500">
                        {currentPage} / {Math.max(totalPages, 1)}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="h-8 w-8"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((transaction) => (
                        <TransactionCard
                          key={transaction.id}
                          transaction={transaction}
                          currentUserId={user.id}
                        />
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">No transactions yet</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">Received</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-600">Sent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-gray-600">Pending</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="send" className="p-6">
                  <h2 className="text-xl font-bold mb-6">Send Money</h2>
                  <SendMoneyForm balance={user.balance} />
                </TabsContent>
                
                <TabsContent value="request" className="p-6">
                  <h2 className="text-xl font-bold mb-6">Request Money</h2>
                  <RequestMoneyForm />
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-blue-100">
                      <ArrowUpRight className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Total Sent</h3>
                      <p className="text-gray-500 text-sm">This month</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">${calculateMonthlySent().toFixed(2)}</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-full bg-green-100">
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Total Received</h3>
                      <p className="text-gray-500 text-sm">This month</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">${calculateMonthlyReceived().toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
