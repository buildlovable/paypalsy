
import { supabase } from './base';
import { PaymentMethod } from '@/lib/types';

// Payment Method Services
export const fetchUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }

  return data as PaymentMethod[];
};

export const setDefaultPaymentMethod = async (userId: string, paymentMethodId: string): Promise<boolean> => {
  // First, set all payment methods to non-default
  const { error: resetError } = await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('user_id', userId);

  if (resetError) {
    console.error('Error resetting default payment methods:', resetError);
    return false;
  }

  // Then, set the selected one as default
  const { error } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', paymentMethodId);

  if (error) {
    console.error('Error setting default payment method:', error);
    return false;
  }

  return true;
};
