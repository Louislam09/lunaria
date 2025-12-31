import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  initializePurchases,
  checkPremiumStatus,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  logOutPurchases,
  syncUserId,
  PREMIUM_ENTITLEMENT_ID,
} from '@/services/premiumService';

// Export entitlement ID for use in components
export { PREMIUM_ENTITLEMENT_ID };
import { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useAuth } from './AuthContext';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  checkPremium: () => Promise<void>;
  purchase: (packageToPurchase: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const { user, localUserId, isAuthenticated } = useAuth();

  // Initialize RevenueCat on mount
  useEffect(() => {
    initPremium();
  }, []);

  // Sync user ID when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      syncUserId(user.id).catch(console.error);
    }
  }, [isAuthenticated, user]);

  const initPremium = async () => {
    try {
      setIsLoading(true);
      const userId = isAuthenticated && user ? user.id : localUserId || undefined;
      await initializePurchases(userId);
      await refreshStatus();
    } catch (error) {
      console.error('Error initializing premium:', error);
      // Continue without premium if initialization fails
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremium = useCallback(async () => {
    try {
      const premium = await checkPremiumStatus();
      setIsPremium(premium);
      return;
    } catch (error) {
      console.error('Error checking premium:', error);
      setIsPremium(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const [premium, info, currentOfferings] = await Promise.all([
        checkPremiumStatus(),
        getCustomerInfo().catch(() => null),
        getOfferings().catch(() => null),
      ]);

      setIsPremium(premium);
      setCustomerInfo(info);
      setOfferings(currentOfferings);
    } catch (error) {
      console.error('Error refreshing premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchase = useCallback(async (packageToPurchase: PurchasesPackage) => {
    try {
      setIsLoading(true);
      const info = await purchasePackage(packageToPurchase);
      setCustomerInfo(info);
      const premium = info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
      setIsPremium(premium);
    } catch (error: any) {
      console.error('Error purchasing:', error);
      // Re-throw to let caller handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await restorePurchases();
      setCustomerInfo(info);
      const premium = info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
      setIsPremium(premium);
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Log out when user logs out
  useEffect(() => {
    if (!isAuthenticated && !user) {
      logOutPurchases().catch(console.error);
    }
  }, [isAuthenticated, user]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        customerInfo,
        offerings,
        checkPremium,
        purchase,
        restore,
        refreshStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
}

