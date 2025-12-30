import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import Purchases from 'react-native-purchases';
import {
  initializeRevenueCat,
  getCustomerInfo,
  hasActiveEntitlement,
  getOfferings,
  purchasePackage,
  restorePurchases,
  identifyUser,
  resetUser,
  ENTITLEMENT_IDENTIFIER,
  getErrorMessage,
  isUserCancellationError,
} from '@/services/revenuecat';
import { useAuth } from './AuthContext';

interface RevenueCatContextType {
  // State
  isPro: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  error: string | null;

  // Actions
  refreshCustomerInfo: () => Promise<void>;
  purchaseSubscription: (pkg: PurchasesPackage) => Promise<boolean>;
  restoreSubscription: () => Promise<boolean>;
  clearError: () => void;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setIsLoading(true);
        
        // Initialize RevenueCat
        const userId = user?.id || undefined;
        await initializeRevenueCat(userId);

        if (!mounted) return;

        // Load initial data
        await Promise.all([
          refreshCustomerInfo(),
          refreshOfferings(),
        ]);
      } catch (err) {
        console.error('Failed to initialize RevenueCat:', err);
        if (mounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Update user identification when auth state changes
  useEffect(() => {
    async function updateUserIdentification() {
      try {
        if (isAuthenticated && user?.id) {
          await identifyUser(user.id);
          await refreshCustomerInfo();
        } else {
          await resetUser();
          await refreshCustomerInfo();
        }
      } catch (err) {
        console.error('Failed to update user identification:', err);
      }
    }

    // Only update if RevenueCat is already initialized
    if (!isLoading) {
      updateUserIdentification();
    }
  }, [isAuthenticated, user?.id, isLoading]);

  // Set up customer info listener
  useEffect(() => {
    const customerInfoUpdateListener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
      setIsPro(info.entitlements.active[ENTITLEMENT_IDENTIFIER] !== undefined);
    });

    return () => {
      customerInfoUpdateListener.remove();
    };
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      setIsPro(info.entitlements.active[ENTITLEMENT_IDENTIFIER] !== undefined);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh customer info:', err);
      setError(getErrorMessage(err));
    }
  }, []);

  const refreshOfferings = useCallback(async () => {
    try {
      const offering = await getOfferings();
      setCurrentOffering(offering);
    } catch (err) {
      console.error('Failed to refresh offerings:', err);
    }
  }, []);

  const purchaseSubscription = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setError(null);
      const info = await purchasePackage(pkg);
      setCustomerInfo(info);
      setIsPro(info.entitlements.active[ENTITLEMENT_IDENTIFIER] !== undefined);
      return true;
    } catch (err) {
      // Don't show error for user cancellation
      if (!isUserCancellationError(err)) {
        setError(getErrorMessage(err));
      }
      return false;
    }
  }, []);

  const restoreSubscription = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const info = await restorePurchases();
      setCustomerInfo(info);
      setIsPro(info.entitlements.active[ENTITLEMENT_IDENTIFIER] !== undefined);
      
      if (!isPro && info.entitlements.active[ENTITLEMENT_IDENTIFIER] === undefined) {
        setError('No se encontraron compras para restaurar');
        return false;
      }
      
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  }, [isPro]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <RevenueCatContext.Provider
      value={{
        isPro,
        isLoading,
        customerInfo,
        currentOffering,
        error,
        refreshCustomerInfo,
        purchaseSubscription,
        restoreSubscription,
        clearError,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
}

export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within RevenueCatProvider');
  }
  return context;
}

