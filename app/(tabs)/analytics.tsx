import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { colors } from '@/utils/colors';
import { router, useFocusEffect } from 'expo-router';
import { CycleStatsCard } from '@/components/analytics/CycleStatsCard';
import { PatternInsightCard } from '@/components/analytics/PatternInsightCard';
import { TrendChart } from '@/components/analytics/TrendChart';
import { SymptomFrequencyChart } from '@/components/analytics/SymptomFrequencyChart';
import { MoodPatternChart } from '@/components/analytics/MoodPatternChart';
import MyIcon from '@/components/ui/Icon';
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator';

export default function AnalyticsScreen() {
  const { data, isLoading: onboardingLoading, isComplete, refresh: refreshOnboarding } = useOnboarding();
  const analytics = useAnalytics();
  const { refetch: refetchAnalytics } = analytics;
  const [refreshing, setRefreshing] = React.useState(false);

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!onboardingLoading && !isComplete) {
      router.replace('/onboarding/wizard');
    }
  }, [onboardingLoading, isComplete]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!onboardingLoading && isComplete && refetchAnalytics) {
        refetchAnalytics();
      }
    }, [onboardingLoading, isComplete])
  );


  if (onboardingLoading || !isComplete || !data.lastPeriodStart) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.lavender} />
        <Text className="mt-4 text-text-muted">Cargando...</Text>
      </View>
    );
  }

  if (analytics.isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
          <Text className="text-2xl font-bold text-text-primary">Analíticas</Text>
          <SyncStatusIndicator />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.lavender} />
          <Text className="mt-4 text-text-muted">Calculando estadísticas...</Text>
        </View>
      </View>
    );
  }

  if (analytics.error) {
    return (
      <View className="flex-1 bg-background">
        <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
          <Text className="text-2xl font-bold text-text-primary">Analíticas</Text>
          <SyncStatusIndicator />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <MyIcon name="CircleAlert" size={32} className="text-red-500" />
          </View>
          <Text className="text-lg font-bold text-text-primary mb-2">Error</Text>
          <Text className="text-text-muted text-center">{analytics.error}</Text>
        </View>
      </View>
    );
  }

  const hasData = analytics.cycleTrends.length > 0 || analytics.symptomFrequency.length > 0;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
        <Text className="text-2xl font-bold text-text-primary">Analíticas</Text>
        <SyncStatusIndicator />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetchAnalytics}
            tintColor={colors.lavender}
            colors={[colors.lavender]}
          />
        }
      >
        <View className="h-20" />

        {!hasData ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
              <MyIcon name="ChartBar" size={48} className="text-primary" />
            </View>
            <Text className="text-xl font-bold text-text-primary mb-2 text-center">
              No hay datos suficientes
            </Text>
            <Text className="text-text-muted text-center px-6">
              Continúa registrando tus síntomas y periodos para ver estadísticas y patrones.
            </Text>
          </View>
        ) : (
          <>
            {/* Cycle Statistics */}
            <CycleStatsCard stats={analytics.cycleStats} />

            {/* Pattern Insights */}
            {analytics.symptomPatterns.length > 0 && (
              <View className="mt-6">
                <PatternInsightCard patterns={analytics.symptomPatterns} />
              </View>
            )}

            {/* Symptom Frequency */}
            {analytics.symptomFrequency.length > 0 && (
              <View className="mt-6">
                <SymptomFrequencyChart data={analytics.symptomFrequency} />
              </View>
            )}

            {/* Mood Patterns */}
            {analytics.moodFrequency.length > 0 && (
              <View className="mt-6 mb-8">
                <MoodPatternChart data={analytics.moodFrequency} />
              </View>
            )}

            {/* Cycle Length Trend */}
            {analytics.cycleTrends.length > 0 && (
              <View className="mt-6">
                <TrendChart
                  data={analytics.cycleTrends}
                  type="cycle"
                  title="Tendencia de Duración del Ciclo"
                />
              </View>
            )}

            {/* Period Duration Trend */}
            {analytics.periodDurationTrends.length > 0 && (
              <View className="mt-6">
                <TrendChart
                  data={analytics.periodDurationTrends}
                  type="period"
                  title="Tendencia de Duración del Periodo"
                />
              </View>
            )}
          </>
        )}

        <View className="h-32" />
      </ScrollView>
    </View>
  );
}
