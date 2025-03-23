
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentMethod } from '@/lib/types';
import { toast } from 'sonner';
import { fetchUserPaymentMethods, setDefaultPaymentMethod } from '@/services/api';
import { createSetupIntent, savePaymentMethod, deletePaymentMethod } from '@/services/stripeService';

export const usePaymentMethods = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const methods = await fetchUserPaymentMethods(user.id);
      setPaymentMethods(methods);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to load payment methods');
      toast.error('Failed to load your payment methods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user, fetchPaymentMethods]);

  const addPaymentMethod = async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to add a payment method');
      return null;
    }

    try {
      console.log('Creating setup intent...');
      const clientSecret = await createSetupIntent();
      console.log('Setup intent created successfully');
      return clientSecret;
    } catch (err) {
      console.error('Error creating setup intent:', err);
      toast.error('Failed to initialize payment method setup. Please try again.');
      return null;
    }
  };

  const confirmPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to save a payment method');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Saving payment method:', paymentMethodId);
      const success = await savePaymentMethod(paymentMethodId);
      if (success) {
        toast.success('Payment method added successfully');
        fetchPaymentMethods();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving payment method:', err);
      toast.error('Failed to save payment method. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultMethod = async (paymentMethodId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update payment methods');
      return false;
    }

    setIsLoading(true);
    try {
      const success = await setDefaultPaymentMethod(user.id, paymentMethodId);
      if (success) {
        fetchPaymentMethods();
        toast.success('Default payment method updated');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error setting default payment method:', err);
      toast.error('Failed to update default payment method');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to remove payment methods');
      return false;
    }

    setIsLoading(true);
    try {
      const success = await deletePaymentMethod(paymentMethodId);
      if (success) {
        fetchPaymentMethods();
        toast.success('Payment method removed');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error removing payment method:', err);
      toast.error('Failed to remove payment method');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    paymentMethods,
    isLoading,
    error,
    addPaymentMethod,
    confirmPaymentMethod,
    setDefaultMethod,
    removePaymentMethod,
    refreshPaymentMethods: fetchPaymentMethods
  };
};
