
import { supabase } from './base';
import { Profile } from '@/lib/types';

// Profile Services
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
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
  } catch (error) {
    console.error('Exception fetching profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating profile:', error);
    return false;
  }
};

// Search for users (for sending money)
export const searchUsers = async (query: string): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data as Profile[];
  } catch (error) {
    console.error('Exception searching users:', error);
    return [];
  }
};
