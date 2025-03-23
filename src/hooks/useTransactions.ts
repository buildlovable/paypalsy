
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserTransactions, createTransaction } from '@/services/api';
import { Transaction } from '@/lib/types';
import { toast } from 'sonner';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchUserTransactions(user.id);
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction data');
      toast.error('Failed to load your transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const sendMoney = async (recipientId: string, amount: number, note?: string) => {
    if (!user) return null;

    try {
      const result = await createTransaction(user.id, recipientId, amount, 'payment', note);
      if (result) {
        fetchTransactions(); // Refresh transactions
        toast.success(`Successfully sent $${amount.toFixed(2)}`);
        return result;
      }
      return null;
    } catch (err) {
      console.error('Error sending money:', err);
      toast.error('Failed to send money. Please try again.');
      return null;
    }
  };

  const requestMoney = async (recipientId: string, amount: number, note?: string) => {
    if (!user) return null;

    try {
      const result = await createTransaction(user.id, recipientId, amount, 'request', note);
      if (result) {
        fetchTransactions(); // Refresh transactions
        toast.success(`Money request sent for $${amount.toFixed(2)}`);
        return result;
      }
      return null;
    } catch (err) {
      console.error('Error requesting money:', err);
      toast.error('Failed to request money. Please try again.');
      return null;
    }
  };

  return { 
    transactions, 
    isLoading, 
    error, 
    sendMoney, 
    requestMoney,
    refreshTransactions: fetchTransactions 
  };
};
