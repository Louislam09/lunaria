import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pb } from '@/services/pocketbase';

// AsyncStorage - install @react-native-async-storage/async-storage
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback for development
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loginEmail: (email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authData = await AsyncStorage.getItem('authData');
      if (authData) {
        const parsed = JSON.parse(authData);
        pb.authStore.save(parsed.token, parsed.model);
        setIsAuthenticated(pb.authStore.isValid);
        if (pb.authStore.model) {
          setUser({
            id: pb.authStore.model.id,
            email: pb.authStore.model.email || '',
            name: pb.authStore.model.name,
          });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginEmail = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      await AsyncStorage.setItem('authData', JSON.stringify({
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
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const loginGoogle = async () => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      await AsyncStorage.setItem('authData', JSON.stringify({
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
      throw new Error(error.message || 'Error al iniciar sesión con Google');
    }
  };

  const logout = async () => {
    pb.authStore.clear();
    await AsyncStorage.removeItem('authData');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginEmail, loginGoogle, logout, loading }}>
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

