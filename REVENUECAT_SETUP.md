# RevenueCat Integration Setup Guide

This guide will help you complete the RevenueCat integration for Lunaria.

## ✅ Completed Steps

1. ✅ SDK installed (`react-native-purchases` and `react-native-purchases-ui`)
2. ✅ API key configured: `test_mYcFamfgheOkrhCxpryQaqvsUtN`
3. ✅ Entitlement ID set: `Lunaria Pro`
4. ✅ Premium service implemented with error handling
5. ✅ Premium context and hooks created
6. ✅ Paywall UI components created
7. ✅ Customer Center component created

## 📋 Next Steps - RevenueCat Dashboard Configuration

### 1. Create Entitlement: "Lunaria Pro"

1. Go to RevenueCat Dashboard → Your Project → Entitlements
2. Click "New Entitlement"
3. Set identifier: `Lunaria Pro`
4. Save

### 2. Create Products

Create three products in your app stores:

#### iOS (App Store Connect):
- **Monthly**: Product ID `monthly`, Subscription Group
- **Yearly**: Product ID `yearly`, Same Subscription Group
- **Lifetime**: Product ID `lifetime`, Non-Consumable

#### Android (Google Play Console):
- **Monthly**: Product ID `monthly`, Subscription
- **Yearly**: Product ID `yearly`, Subscription
- **Lifetime**: Product ID `lifetime`, One-time purchase

### 3. Link Products to RevenueCat

1. Go to RevenueCat Dashboard → Products
2. For each product:
   - Click "New Product"
   - Enter product identifier (`monthly`, `yearly`, `lifetime`)
   - Select platform (iOS/Android)
   - Link to your app store product
   - Attach to entitlement: `Lunaria Pro`

### 4. Create Offering

1. Go to RevenueCat Dashboard → Offerings
2. Click "New Offering"
3. Name: "Default Offering"
4. Add packages:
   - Monthly package (using `monthly` product)
   - Annual package (using `yearly` product)
   - Lifetime package (using `lifetime` product)
5. Set as "Current Offering"

## 🔧 Environment Variables

Add to your `.env` file:

```env
EXPO_PUBLIC_REVENUECAT_API_KEY=test_mYcFamfgheOkrhCxpryQaqvsUtN
```

**Note:** The code will use `EXPO_PUBLIC_REVENUECAT_API_KEY` by default. If you want platform-specific keys:

```env
# Option 1: Single key for both platforms (recommended for most cases)
EXPO_PUBLIC_REVENUECAT_API_KEY=your_api_key_here

# Option 2: Platform-specific keys (if needed)
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your_ios_key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your_android_key
```

The code will automatically use the appropriate key based on the platform, falling back to the general key if platform-specific keys aren't set.

## 📱 Testing

### Test Store (Recommended for Development)

RevenueCat provides a Test Store that works immediately:

1. Use your test API key (already configured)
2. Products are automatically available
3. No need to configure App Store/Play Store initially

### Sandbox Testing

1. **iOS**: Use sandbox test accounts in App Store Connect
2. **Android**: Use test accounts in Google Play Console

## 🎯 Usage Examples

### Check Premium Status

```typescript
import { usePremium } from '@/hooks/usePremium';

function MyComponent() {
  const { isPremium, isLoading } = usePremium();
  
  if (isPremium) {
    // Show premium features
  }
}
```

### Show Paywall

```typescript
import { PremiumModal } from '@/components/premium/PremiumModal';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);
  
  return (
    <>
      <Button onPress={() => setShowPaywall(true)}>Upgrade</Button>
      <PremiumModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
```

### Use RevenueCat Paywall UI

```typescript
import { RevenueCatPaywall } from '@/components/premium/RevenueCatPaywall';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);
  
  return (
    <RevenueCatPaywall 
      visible={showPaywall} 
      onClose={() => setShowPaywall(false)}
      onPurchaseComplete={() => {
        // Handle successful purchase
      }}
    />
  );
}
```

### Customer Center

```typescript
import { CustomerCenter } from '@/components/premium/CustomerCenter';

function SettingsScreen() {
  return <CustomerCenter />;
}
```

## 🔍 Error Handling

The implementation includes comprehensive error handling:

- `PURCHASE_CANCELLED`: User cancelled purchase (silently handled)
- `NETWORK_ERROR`: Network connectivity issues
- `PURCHASE_NOT_ALLOWED`: Purchases disabled on device
- `PRODUCT_NOT_AVAILABLE`: Product not available for purchase

## 📚 Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [React Native SDK Docs](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
- [Paywall UI Docs](https://www.revenuecat.com/docs/tools/paywalls)
- [Customer Center Docs](https://www.revenuecat.com/docs/tools/customer-center)

## 🐛 Troubleshooting

### Products not showing
- Verify products are linked in RevenueCat dashboard
- Check offering is set as "Current"
- Ensure API key matches your project

### Purchases not working
- Check device has in-app purchases enabled
- Verify sandbox/test accounts are set up correctly
- Check RevenueCat dashboard for error logs

### Entitlement not activating
- Verify entitlement identifier matches: `Lunaria Pro`
- Check products are attached to entitlement
- Review customer info in RevenueCat dashboard

