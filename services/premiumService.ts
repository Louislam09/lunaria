import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesError,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Key - Loaded from environment variables
// Set EXPO_PUBLIC_REVENUECAT_API_KEY in your .env file
// For production, you may want separate keys for iOS and Android:
// - EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
// - EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ||
  Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
    default: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
  }) || '';

// Entitlement identifier for premium subscription
export const PREMIUM_ENTITLEMENT_ID = 'Lunaria Pro';

// Product identifiers (these should match your RevenueCat dashboard)
export const PRODUCT_IDENTIFIERS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;

// Initialize RevenueCat SDK
export async function initializePurchases(userId?: string): Promise<void> {
  try {
    const apiKey = REVENUECAT_API_KEY;

    if (!apiKey) {
      console.warn(
        'RevenueCat API key not configured. ' +
        'Please set EXPO_PUBLIC_REVENUECAT_API_KEY in your .env file. ' +
        'Premium features will be disabled.'
      );
      return;
    }

    // Configure RevenueCat SDK
    await Purchases.configure({ apiKey });

    // Set user ID if provided (for authenticated users)
    // This links purchases to a specific user account
    if (userId) {
      try {
        await Purchases.logIn(userId);
        console.log('RevenueCat: User logged in successfully');
      } catch (loginError) {
        console.error('RevenueCat: Error logging in user:', loginError);
        // Continue initialization even if login fails
      }
    }

    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      console.log('RevenueCat: Debug logging enabled');
    }

    // Set up listener for customer info updates
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log('RevenueCat: Customer info updated', {
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
      });
    });

    console.log('RevenueCat: SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    // Don't throw - allow app to continue without premium features
    throw error;
  }
}

// Check if user has premium subscription
export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;

    if (hasEntitlement) {
      const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      console.log('RevenueCat: Premium status active', {
        identifier: entitlement.identifier,
        expirationDate: entitlement.expirationDate,
        productIdentifier: entitlement.productIdentifier,
      });
    }

    return hasEntitlement;
  } catch (error) {
    console.error('Error checking premium status:', error);
    // If there's an error, assume not premium
    return false;
  }
}

// Get customer info
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Error getting customer info:', error);
    throw error;
  }
}

// Get available offerings (subscription packages)
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
}

// Purchase a package with proper error handling
export async function purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
  try {
    console.log('RevenueCat: Attempting to purchase package', {
      identifier: packageToPurchase.identifier,
      productIdentifier: packageToPurchase.product.identifier,
      price: packageToPurchase.product.priceString,
    });

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    console.log('RevenueCat: Purchase successful', {
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
    });

    return customerInfo;
  } catch (error: any) {
    // Handle specific RevenueCat error codes
    const errorCode = error?.code;

    if (errorCode === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      console.log('RevenueCat: Purchase cancelled by user');
      throw new Error('PURCHASE_CANCELLED');
    }

    if (errorCode === PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) {
      console.error('RevenueCat: Purchase not allowed');
      throw new Error('PURCHASE_NOT_ALLOWED');
    }

    if (errorCode === PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR) {
      console.error('RevenueCat: Product not available');
      throw new Error('PRODUCT_NOT_AVAILABLE');
    }

    if (errorCode === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
      console.error('RevenueCat: Network error');
      throw new Error('NETWORK_ERROR');
    }

    // Handle user cancellation (legacy check)
    if (error.userCancelled) {
      throw new Error('PURCHASE_CANCELLED');
    }

    console.error('RevenueCat: Purchase error', errorCode, error.message);
    throw error;
  }
}

// Restore purchases
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    console.log('RevenueCat: Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();

    const hasEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    console.log('RevenueCat: Restore completed', {
      hasPremium: hasEntitlement,
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
    });

    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}

// Present Customer Center (for managing subscriptions)
export async function presentCustomerCenter(): Promise<void> {
  try {
    // Note: Customer Center is available via RevenueCat Paywall UI
    // For manual implementation, you can use:
    // - iOS: StoreKit's manage subscriptions URL
    // - Android: Play Store subscription management
    console.log('RevenueCat: Presenting customer center...');

    // This will be handled by the Paywall UI component
    // For now, we'll provide a helper to get the management URL
  } catch (error) {
    console.error('Error presenting customer center:', error);
    throw error;
  }
}

// Get management URL for subscriptions (platform-specific)
export function getSubscriptionManagementURL(): string | null {
  // iOS: Use StoreKit management URL
  // Android: Use Play Store subscription management
  // This is typically handled by RevenueCat Paywall UI
  return null;
}

// Log out user (for when user logs out of app)
export async function logOutPurchases(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Error logging out purchases:', error);
    throw error;
  }
}

// Sync user ID with RevenueCat (call when user logs in)
export async function syncUserId(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Error syncing user ID:', error);
    throw error;
  }
}

