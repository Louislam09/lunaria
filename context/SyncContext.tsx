import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSyncStatus, performSync, SyncFrequency, setSyncFrequency as setSyncFrequencyService, shouldSync } from '@/services/syncService';
import { useAuth } from './AuthContext';
import { initDatabase, getPersister } from '@/services/database';

interface SyncContextType {
  lastSyncTime: Date | null;
  pendingItems: number;
  frequency: SyncFrequency;
  isSyncing: boolean;
  sync: () => Promise<void>;
  setSyncFrequency: (frequency: SyncFrequency) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingItems, setPendingItems] = useState(0);
  const [frequency, setFrequency] = useState<SyncFrequency>('daily');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database on mount
  useEffect(() => {
    const initialize = async () => {
      await initDatabase();
      // Ensure persister auto-load is started (for detecting external DB changes)
      try {
        const persister = getPersister();
        persister.startAutoLoad();
      } catch (error) {
        // Persister might not be ready yet, but that's okay
        console.warn('Could not start auto-load:', error);
      }
      setIsInitialized(true);
      refreshStatus();
    };
    initialize();
  }, []);

  // Refresh sync status
  const refreshStatus = async () => {
    if (!isInitialized) return;
    
    try {
      const status = await getSyncStatus();
      setLastSyncTime(status.lastSyncTime);
      setPendingItems(status.pendingItems);
      setFrequency(status.frequency);
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  };

  // Auto-refresh status periodically and check if sync is needed
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    refreshStatus();
    
    // Check if sync is needed on app start
    const checkAndSync = async () => {
      if (await shouldSync() && !isSyncing) {
        try {
          await sync();
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }
    };
    
    checkAndSync();
    
    const interval = setInterval(() => {
      refreshStatus();
      checkAndSync();
    }, 300000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [isInitialized, isAuthenticated]);

  // Perform sync
  const sync = async () => {
    if (!isAuthenticated || !user || isSyncing) return;

    setIsSyncing(true);
    try {
      await performSync(user.id);
      await refreshStatus();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  // Set sync frequency
  const setSyncFrequency = async (newFrequency: SyncFrequency) => {
    await setSyncFrequencyService(newFrequency);
    await refreshStatus();
  };

  return (
    <SyncContext.Provider
      value={{
        lastSyncTime,
        pendingItems,
        frequency,
        isSyncing,
        sync,
        setSyncFrequency,
        refreshStatus,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}

