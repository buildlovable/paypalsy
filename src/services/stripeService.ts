
import { supabase } from './base';
import { PaymentMethod } from '@/lib/types';

// Calls the Stripe edge function with authentication
const callStripeFunction = async (action: string, data: Record<string, any> = {}) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !sessionData.session) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(
    'https://nohctgbksxaouudbqkum.supabase.co/functions/v1/stripe-payment-methods',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({
        action,
        ...data,
      }),
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process payment request');
  }
  
  return response.json();
};

export const createSetupIntent = async () => {
  const result = await callStripeFunction('create-setup-intent');
  return result.clientSecret;
};

export const getPaymentMethods = async (): Promise<any[]> => {
  const result = await callStripeFunction('get-payment-methods');
  return result.paymentMethods || [];
};

export const savePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  const result = await callStripeFunction('save-payment-method', { paymentMethodId });
  return result.success;
};

export const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  const result = await callStripeFunction('set-default-payment-method', { paymentMethodId });
  return result.success;
};

export const deletePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  const result = await callStripeFunction('delete-payment-method', { paymentMethodId });
  return result.success;
};
