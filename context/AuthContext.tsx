import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pb } from '@/services/pocketbase';
import Storage from 'expo-sqlite/kv-store';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  localUserId: string | null;
  loginEmail: (email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authData = await Storage.getItem('authData');
      if (authData) {
        const parsed = JSON.parse(authData);
        try {
          pb.authStore.save(parsed.token, parsed.model);
          setIsAuthenticated(pb.authStore.isValid);
          if (pb.authStore.model) {
            setUser({
              id: pb.authStore.model.id,
              email: pb.authStore.model.email || '',
              name: pb.authStore.model.name,
            });
          }
        } catch (pbError) {
          // PocketBase not available or connection failed - work locally
          console.log('PocketBase not available, working locally');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // No auth data - create local user ID for MVP
        const savedLocalUserId = await Storage.getItem('localUserId');
        if (!savedLocalUserId) {
          const newLocalUserId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await Storage.setItem('localUserId', newLocalUserId);
          setLocalUserId(newLocalUserId);
        } else {
          setLocalUserId(savedLocalUserId);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Continue working locally even if there's an error
    } finally {
      setLoading(false);
    }
  };

  const loginEmail = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      await Storage.setItem('authData', JSON.stringify({
        token: pb.authStore.token,
        model: pb.authStore.model,
      }));
      setIsAuthenticated(true);
      setUser({
        id: authData.record.id,
        email: authData.record.email || '',
        name: authData.record.name,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión. PocketBase no está disponible.');
    }
  };

  const loginGoogle = async () => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      await Storage.setItem('authData', JSON.stringify({
        token: pb.authStore.token,
        model: pb.authStore.model,
      }));
      setIsAuthenticated(true);
      if (pb.authStore.model) {
        setUser({
          id: pb.authStore.model.id,
          email: pb.authStore.model.email || '',
          name: pb.authStore.model.name,
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión con Google. PocketBase no está disponible.');
    }
  };

  const logout = async () => {
    pb.authStore.clear();
    await Storage.removeItem('authData');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, localUserId, loginEmail, loginGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

