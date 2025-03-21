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
  // First fetch the transactions
  const { data: transactionsData, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('date', { ascending: false });

  if (transactionsError) {
    console.error('Error fetching transactions:', transactionsError);
    return [];
  }

  // Then get all the unique user IDs involved in these transactions
  const userIds = new Set<string>();
  transactionsData.forEach(transaction => {
    userIds.add(transaction.sender_id);
    userIds.add(transaction.recipient_id);
  });

  // Fetch profile data for all these users
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, avatar')
    .in('id', Array.from(userIds));

  if (profilesError) {
    console.error('Error fetching profiles for transactions:', profilesError);
    return [];
  }

  // Create a map of user IDs to profile data for quick lookup
  const profilesMap = new Map();
  profilesData.forEach(profile => {
    profilesMap.set(profile.id, profile);
  });

  // Transform transactions data with profile information
  return transactionsData.map(transaction => {
    const senderProfile = profilesMap.get(transaction.sender_id) || { name: 'Unknown', avatar: '' };
    const recipientProfile = profilesMap.get(transaction.recipient_id) || { name: 'Unknown', avatar: '' };
    
    return {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type as 'payment' | 'request',
      status: transaction.status as 'pending' | 'completed' | 'rejected',
      date: transaction.date,
      note: transaction.note,
      sender: {
        id: transaction.sender_id,
        name: senderProfile.name,
        avatar: senderProfile.avatar,
      },
      recipient: {
        id: transaction.recipient_id,
        name: recipientProfile.name,
        avatar: recipientProfile.avatar,
      }
    };
  });
};

export const createTransaction = async (
  senderId: string, 
  recipientId: string, 
  amount: number, 
  type: 'payment' | 'request',
  note?: string
): Promise<Transaction | null> => {
  // Here's where we need to fix the type errors
  const status: 'pending' | 'completed' | 'rejected' = type === 'payment' ? 'completed' : 'pending';
  
  const transaction = {
    sender_id: senderId,
    recipient_id: recipientId,
    amount,
    type,
    status,
    note,
    date: new Date().toISOString(),
  };

  // Insert the transaction
  const { data: insertedData, error: insertError } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();

  if (insertError) {
    console.error('Error creating transaction:', insertError);
    return null;
  }

  // Fetch sender and recipient profiles
  const { data: senderData, error: senderError } = await supabase
    .from('profiles')
    .select('name, avatar')
    .eq('id', senderId)
    .single();

  if (senderError) {
    console.error('Error fetching sender profile:', senderError);
  }

  const { data: recipientData, error: recipientError } = await supabase
    .from('profiles')
    .select('name, avatar')
    .eq('id', recipientId)
    .single();

  if (recipientError) {
    console.error('Error fetching recipient profile:', recipientError);
  }

  // If it's a payment, update the balances
  if (type === 'payment') {
    // Deduct from sender
    const { error: senderBalanceError } = await supabase.rpc(
      'update_balance', 
      { 
        user_id: senderId, 
        amount_change: -amount 
      }
    );
    
    if (senderBalanceError) {
      console.error('Error updating sender balance:', senderBalanceError);
    }
    
    // Add to recipient
    const { error: recipientBalanceError } = await supabase.rpc(
      'update_balance', 
      { 
        user_id: recipientId, 
        amount_change: amount 
      }
    );
    
    if (recipientBalanceError) {
      console.error('Error updating recipient balance:', recipientBalanceError);
    }
  }

  return {
    id: insertedData.id,
    amount: insertedData.amount,
    type: insertedData.type as 'payment' | 'request',
    status: insertedData.status as 'pending' | 'completed' | 'rejected',
    date: insertedData.date,
    note: insertedData.note,
    sender: {
      id: senderId,
      name: senderData?.name || 'Unknown',
      avatar: senderData?.avatar || '',
    },
    recipient: {
      id: recipientId,
      name: recipientData?.name || 'Unknown',
      avatar: recipientData?.avatar || '',
    }
  };
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
