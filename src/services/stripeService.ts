
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from '@/lib/types';

// Calls the Stripe edge function with authentication
const callStripeFunction = async (action: string, data: Record<string, any> = {}) => {
  const { data: authData, error: authError } = await supabase.auth.getSession();
  
  if (authError || !authData.session) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(
      'https://nohctgbksxaouudbqkum.supabase.co/functions/v1/stripe-payment-methods',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`,
        },
        body: JSON.stringify({
          action,
          ...data,
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stripe API error:', errorData);
      throw new Error(errorData.error || 'Failed to process payment request');
    }
    
    return response.json();
  } catch (error) {
    console.error('Stripe service error:', error);
    throw error;
  }
};

export const createSetupIntent = async () => {
  try {
    const result = await callStripeFunction('create-setup-intent');
    return result.clientSecret;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
};

export const getPaymentMethods = async (): Promise<any[]> => {
  try {
    const result = await callStripeFunction('get-payment-methods');
    return result.paymentMethods || [];
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
};

export const savePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  try {
    const result = await callStripeFunction('save-payment-method', { paymentMethodId });
    return result.success;
  } catch (error) {
    console.error('Error saving payment method:', error);
    throw error;
  }
};

export const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  try {
    const result = await callStripeFunction('set-default-payment-method', { paymentMethodId });
    return result.success;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

export const deletePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  try {
    const result = await callStripeFunction('delete-payment-method', { paymentMethodId });
    return result.success;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};
