import { usePremium as usePremiumContext } from '@/context/PremiumContext';

/**
 * Hook for easy access to premium status throughout the app
 * This is a convenience wrapper around PremiumContext
 */
export function usePremium() {
  return usePremiumContext();
}

