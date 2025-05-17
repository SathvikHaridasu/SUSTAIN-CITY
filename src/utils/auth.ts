
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  name?: string;
}

// Get current user from Supabase session
export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    return null;
  }
  
  return {
    id: data.session.user.id,
    email: data.session.user.email || '',
    name: data.session.user.user_metadata?.name
  };
};

// Sign in with email and password
export const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to login' };
  }
};

// Sign up with email and password
export const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || ''
        }
      }
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Supabase signup doesn't always immediately log in the user
    // in some configurations, email confirmation may be required
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to register' };
  }
};

// Sign out
export const logout = async (): Promise<void> => {
  // Clear any city-related localStorage items
  const user = await getCurrentUser();
  if (user) {
    // Clear the current city ID
    localStorage.removeItem('current-city-id');
  }
  
  // Sign out from Supabase
  await supabase.auth.signOut();
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};
