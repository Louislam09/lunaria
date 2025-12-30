# RevenueCat Integration Guide

This document explains how RevenueCat is integrated into the Lunaria app and how to use it.

## Overview

RevenueCat SDK has been integrated to handle in-app subscriptions for **Lunaria Pro**. The integration includes:

- ✅ SDK initialization with API key
- ✅ Entitlement checking for "Lunaria Pro"
- ✅ Customer info management
- ✅ Paywall UI for subscription purchases
- ✅ Customer Center for subscription management
- ✅ User identification on login/logout
- ✅ Product configuration (Monthly, Yearly, Lifetime)

## Architecture

### Service Layer (`services/revenuecat.ts`)

Core RevenueCat operations:
- `initializeRevenueCat()` - Initialize SDK with API key
- `getCustomerInfo()` - Get current customer information
- `hasActiveEntitlement()` - Check if user has "Lunaria Pro"
- `getOfferings()` - Get available subscription packages
- `purchasePackage()` - Purchase a subscription package
- `restorePurchases()` - Restore previous purchases
- `identifyUser()` - Link RevenueCat user to app user
- `resetUser()` - Reset RevenueCat user (on logout)

### Context Layer (`context/RevenueCatContext.tsx`)

Provides global subscription state:
- `isPro` - Boolean indicating if user has active "Lunaria Pro" entitlement
- `customerInfo` - Current customer information
- `currentOffering` - Available subscription packages
- `purchaseSubscription()` - Purchase a package
- `restoreSubscription()` - Restore purchases
- `refreshCustomerInfo()` - Refresh customer data

### Components

1. **Paywall** (`components/revenuecat/Paywall.tsx`)
   - Displays subscription options using RevenueCat Paywall UI
   - Handles purchase flow
   - Shows loading and error states

2. **Customer Center** (`components/revenuecat/CustomerCenter.tsx`)
   - Manages active subscriptions
   - Restore purchases functionality
   - Shows subscription status

## Usage

### Checking Subscription Status

```typescript
import { useRevenueCat } from '@/hooks/useRevenueCat';

function MyComponent() {
  const { isPro, isLoading } = useRevenueCat();

  if (isLoading) {
    return <Loading />;
  }

  if (isPro) {
    // Show Pro features
    return <ProFeatures />;
  } else {
    // Show upgrade prompt
    return <UpgradePrompt />;
  }
}
```

### Opening the Paywall

```typescript
import { useState } from 'react';
import { Paywall } from '@/components/revenuecat/Paywall';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Button onPress={() => setShowPaywall(true)}>
        Upgrade to Pro
      </Button>
      
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseComplete={() => {
          // Handle successful purchase
          console.log('User upgraded to Pro!');
        }}
      />
    </>
  );
}
```

### Opening Customer Center

```typescript
import { useState } from 'react';
import { CustomerCenter } from '@/components/revenuecat/CustomerCenter';

function MyComponent() {
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);

  return (
    <>
      <Button onPress={() => setShowCustomerCenter(true)}>
        Manage Subscription
      </Button>
      
      <CustomerCenter
        visible={showCustomerCenter}
        onClose={() => setShowCustomerCenter(false)}
      />
    </>
  );
}
```

### Restoring Purchases

```typescript
import { useRevenueCat } from '@/hooks/useRevenueCat';

function MyComponent() {
  const { restoreSubscription } = useRevenueCat();

  const handleRestore = async () => {
    const success = await restoreSubscription();
    if (success) {
      Alert.alert('Success', 'Purchases restored!');
    } else {
      Alert.alert('Error', 'No purchases found to restore');
    }
  };

  return <Button onPress={handleRestore}>Restore Purchases</Button>;
}
```

## Configuration

### API Key

The RevenueCat API key is configured in `services/revenuecat.ts`:

```typescript
const REVENUECAT_API_KEY = 'test_mYcFamfgheOkrhCxpryQaqvsUtN';
```

**Important**: Replace this with your production API key before releasing to production.

### Entitlement Identifier

The entitlement identifier is defined as:

```typescript
export const ENTITLEMENT_IDENTIFIER = 'Lunaria Pro';
```

This must match the entitlement identifier configured in your RevenueCat dashboard.

### Product Identifiers

Product identifiers are defined as:

```typescript
export const PRODUCT_IDENTIFIERS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;
```

These must match the product identifiers configured in:
1. Your app store (App Store Connect / Google Play Console)
2. Your RevenueCat dashboard

## Setup Instructions

### 1. RevenueCat Dashboard Setup

1. Create a RevenueCat account at https://www.revenuecat.com
2. Create a new project for your app
3. Configure your app:
   - Add iOS app (if applicable)
   - Add Android app (if applicable)
4. Create products:
   - `monthly` - Monthly subscription
   - `yearly` - Yearly subscription
   - `lifetime` - Lifetime purchase
5. Create entitlement:
   - Identifier: `Lunaria Pro`
   - Attach all three products to this entitlement
6. Create an offering:
   - Add all three products
   - Set as current offering

### 2. App Store Setup

#### iOS (App Store Connect)
1. Create in-app purchases:
   - Monthly subscription
   - Yearly subscription
   - Non-consumable (for lifetime)

#### Android (Google Play Console)
1. Create subscription products:
   - Monthly subscription
   - Yearly subscription
2. Create in-app product:
   - Lifetime (one-time purchase)

### 3. Link Products in RevenueCat

1. In RevenueCat dashboard, go to Products
2. For each product, link it to the corresponding App Store/Play Store product
3. Ensure product identifiers match exactly

### 4. Update API Key

Replace the test API key in `services/revenuecat.ts` with your production API key:

```typescript
const REVENUECAT_API_KEY = 'your_production_api_key_here';
```

## User Identification

RevenueCat automatically identifies users based on authentication state:

- **On Login**: User ID is passed to RevenueCat via `identifyUser()`
- **On Logout**: RevenueCat user is reset via `resetUser()`
- **Anonymous Users**: RevenueCat uses anonymous user IDs

This ensures that subscriptions are properly linked to user accounts and can be restored across devices.

## Error Handling

The integration includes comprehensive error handling:

- **User Cancellation**: Silently handled (no error shown)
- **Network Errors**: User-friendly error messages
- **Store Errors**: Descriptive error messages
- **Purchase Errors**: Detailed error information

Error messages are localized in Spanish to match the app's language.

## Testing

### Sandbox Testing

1. Use test accounts in App Store Connect / Google Play Console
2. Test purchases will be processed in sandbox mode
3. Test subscriptions expire quickly in sandbox (for testing renewal flow)

### Test Scenarios

1. ✅ Purchase monthly subscription
2. ✅ Purchase yearly subscription
3. ✅ Purchase lifetime
4. ✅ Restore purchases
5. ✅ Cancel subscription (via Customer Center)
6. ✅ Subscription renewal
7. ✅ Subscription expiration
8. ✅ User login/logout with active subscription

## Best Practices

1. **Always check `isLoading`** before checking `isPro` status
2. **Handle purchase cancellations gracefully** - don't show errors
3. **Refresh customer info** after important actions (purchase, restore)
4. **Show loading states** during purchase operations
5. **Provide restore option** for users who switch devices
6. **Handle offline scenarios** - RevenueCat caches customer info

## Troubleshooting

### Purchases not working
- Verify API key is correct
- Check product identifiers match exactly
- Ensure products are approved in App Store/Play Store
- Verify entitlement is configured correctly

### Subscription status not updating
- Call `refreshCustomerInfo()` after purchase
- Check RevenueCat dashboard for purchase status
- Verify user identification is working

### Customer Center not loading
- Ensure RevenueCat Paywall UI is properly installed
- Check network connectivity
- Verify API key permissions

## Additional Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [React Native SDK Docs](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
- [Paywall UI Docs](https://www.revenuecat.com/docs/tools/paywalls)
- [Customer Center Docs](https://www.revenuecat.com/docs/tools/customer-center)

