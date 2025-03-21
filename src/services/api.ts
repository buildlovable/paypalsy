
import { supabase } from '@/integrations/supabase/client';
import { User, Transaction, PaymentMethod, Profile } from '@/lib/types';

// Profile Services
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }

  return true;
};

// Transaction Services
export const fetchUserTransactions = async (userId: string): Promise<Transaction[]> => {
  // We need to get sender and recipient details for each transaction
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      sender:sender_id(id, name, avatar),
      recipient:recipient_id(id, name, avatar)
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  // Transform to match our Transaction type
  return (data || []).map(item => ({
    id: item.id,
    amount: item.amount,
    type: item.type,
    status: item.status,
    date: item.date,
    note: item.note,
    sender: {
      id: item.sender.id,
      name: item.sender.name,
      avatar: item.sender.avatar,
    },
    recipient: {
      id: item.recipient.id,
      name: item.recipient.name,
      avatar: item.recipient.avatar,
    }
  }));
};

export const createTransaction = async (
  senderId: string, 
  recipientId: string, 
  amount: number, 
  type: 'payment' | 'request',
  note?: string
): Promise<Transaction | null> => {
  const transaction = {
    sender_id: senderId,
    recipient_id: recipientId,
    amount,
    type,
    status: type === 'payment' ? 'completed' : 'pending',
    note,
    date: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  // If it's a payment, update the balances
  if (type === 'payment') {
    // Deduct from sender
    await supabase.rpc('update_balance', { 
      user_id: senderId, 
      amount_change: -amount 
    });
    
    // Add to recipient
    await supabase.rpc('update_balance', { 
      user_id: recipientId, 
      amount_change: amount 
    });
  }

  return data[0] as unknown as Transaction;
};

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

// Search for users (for sending money)
export const searchUsers = async (query: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data as User[];
};
