
import { supabase } from './base';
import { Transaction } from '@/lib/types';

// Define the correct parameter types for the update_balance RPC function
interface UpdateBalanceParams {
  user_id: string;
  amount_change: number;
}

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
    // Deduct from sender - using properly typed parameters
    const updateSenderParams: UpdateBalanceParams = {
      user_id: senderId,
      amount_change: -amount
    };
    
    const { error: senderBalanceError } = await supabase.rpc(
      'update_balance', 
      updateSenderParams
    );
    
    if (senderBalanceError) {
      console.error('Error updating sender balance:', senderBalanceError);
    }
    
    // Add to recipient - using properly typed parameters
    const updateRecipientParams: UpdateBalanceParams = {
      user_id: recipientId,
      amount_change: amount
    };
    
    const { error: recipientBalanceError } = await supabase.rpc(
      'update_balance', 
      updateRecipientParams
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
