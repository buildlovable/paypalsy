
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  phone?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'payment' | 'request';
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  note?: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  recipient: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  last_four: string;
  card_brand: string;
  expires_at: string;
  is_default: boolean;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export interface Profile extends User {
  // Additional profile fields can be added here
}

// Helper type to convert Supabase user to our app's User type
export const mapSupabaseUser = (profile: any): User => {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar || '',
    balance: profile.balance || 0,
    phone: profile.phone || '',
  };
};
