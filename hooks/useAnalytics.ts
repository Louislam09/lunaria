import { useState, useEffect, useCallback } from 'react';
import { getAnalytics, AnalyticsData } from '@/services/analyticsService';
import { useAuth } from '@/context/AuthContext';

export function useAnalytics() {
  const { user, isAuthenticated, localUserId } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshAnalytics = useCallback(async () => {
    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) {
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getAnalytics(userId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error loading analytics'));
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, localUserId]);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
  };
}

