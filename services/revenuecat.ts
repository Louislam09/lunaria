import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PURCHASES_ERROR_CODE,
  PurchasesError
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Key
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

// Entitlement identifier
export const ENTITLEMENT_IDENTIFIER = 'Lunaria Pro';

// Product identifiers
export const PRODUCT_IDENTIFIERS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;

/**
 * Initialize RevenueCat SDK
 * Should be called once when the app starts
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  try {
    const apiKey = Platform.select({
      ios: REVENUECAT_API_KEY, // Use same key for both platforms in test mode
      android: REVENUECAT_API_KEY,
      default: REVENUECAT_API_KEY,
    });

    if (!apiKey) {
      throw new Error('RevenueCat API key not configured for this platform');
    }

    await Purchases.configure({ apiKey });

    // Set user ID if provided (for authenticated users)
    if (userId) {
      await Purchases.logIn(userId);
    }

    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    throw error;
  }
}

/**
 * Check if user has active entitlement
 */
export async function hasActiveEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER] !== undefined;
  } catch (error) {
    console.error('Failed to check entitlement:', error);
    return false;
  }
}

/**
 * Get current offerings (available subscription packages)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error) {
    const purchasesError = error as PurchasesError;

    // User cancelled - don't throw, just return current customer info
    if (purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED) {
      return await getCustomerInfo();
    }

    // Other errors - rethrow
    console.error('Failed to purchase package:', error);
    throw error;
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
}

/**
 * Identify user with RevenueCat
 * Call this when user logs in
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Failed to identify user:', error);
    throw error;
  }
}

/**
 * Reset user identification
 * Call this when user logs out
 */
export async function resetUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to reset user:', error);
    throw error;
  }
}

/**
 * Check if error is a user cancellation
 */
export function isUserCancellationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const purchasesError = error as PurchasesError;
    return purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED;
  }
  return false;
}

/**
 * Get readable error message
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const purchasesError = error as PurchasesError;

    switch (purchasesError.code) {
      case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED:
        return 'Compra cancelada';
      case PURCHASES_ERROR_CODE.STORE_PROBLEM:
        return 'Problema con la tienda. Por favor, intenta más tarde';
      case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED:
        return 'Las compras no están permitidas en este dispositivo';
      case PURCHASES_ERROR_CODE.PURCHASE_INVALID:
        return 'Compra inválida';
      case PURCHASES_ERROR_CODE.NETWORK_ERROR:
        return 'Error de conexión. Verifica tu internet';
      default:
        return purchasesError.message || 'Error desconocido';
    }
  }

  return 'Error desconocido';
}

