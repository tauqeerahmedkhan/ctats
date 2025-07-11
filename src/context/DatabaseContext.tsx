import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserRole, UserPermissions, getRolePermissions } from '../types/User';

interface DatabaseContextType {
  user: User | null;
  userRole: UserRole;
  permissions: UserPermissions;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  user: null,
  userRole: 'viewer',
  permissions: getRolePermissions('viewer'),
  isLoading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateUserRole: () => {},
  hasPermission: () => false,
});

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin'); // Default to admin for now
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const permissions = getRolePermissions(userRole);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // In a real app, you would fetch the user's role from the database
      // For now, we'll default to admin
      if (session?.user) {
        setUserRole('admin');
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole('admin');
      } else {
        setUserRole('viewer');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) {
      setError(error.message);
    }
    return { error };
  };

  const signOut = async () => {
    setError(null);
    setUserRole('viewer');
    await supabase.auth.signOut();
  };
  
  const updateUserRole = (role: UserRole) => {
    setUserRole(role);
  };
  
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions[permission];
  };

  return (
    <DatabaseContext.Provider value={{ 
      user, 
      userRole,
      permissions,
      isLoading, 
      error, 
      signIn, 
      signUp, 
      signOut,
      updateUserRole,
      hasPermission
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};