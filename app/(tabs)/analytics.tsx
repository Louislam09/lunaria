import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import MyIcon from '@/components/ui/Icon';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePremium } from '@/hooks/usePremium';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { SimpleBarChart } from '@/components/analytics/SimpleBarChart';
import { formatDate } from '@/utils/dates';
import { colors } from '@/utils/colors';

export default function AnalyticsScreen() {
  const { analytics, isLoading, error } = useAnalytics();
  const { isPremium } = usePremium();

  if (!isPremium) {
    return (
      <View className="flex-1 bg-background">
        <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
          <Text className="text-2xl font-bold text-text-primary">
            Análisis Avanzado
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="h-24" />
          <PremiumGate showUpgradePrompt={true} />
        </ScrollView>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.lavender} />
        <Text className="text-text-muted mt-4">Cargando análisis...</Text>
      </View>
    );
  }

  if (error || !analytics) {
    return (
      <View className="flex-1 bg-background">
        <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
          <Text className="text-2xl font-bold text-text-primary">
            Análisis Avanzado
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="h-24" />
          <View className="bg-red-50 rounded-2xl p-4 border border-red-200">
            <Text className="text-red-600 font-semibold">
              Error al cargar los análisis
            </Text>
            <Text className="text-red-500 text-sm mt-1">
              {error?.message || 'No se pudieron cargar los datos'}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const cycleChartData = analytics.cycleTrends.slice(-6).map((trend, index) => ({
    label: formatDate(trend.date, 'short').split(' ')[0],
    value: trend.cycleLength,
    color: colors.lavender,
  }));

  const periodChartData = analytics.cycleTrends.slice(-6).map((trend) => ({
    label: formatDate(trend.date, 'short').split(' ')[0],
    value: trend.periodLength,
    color: colors.period,
  }));

  const symptomChartData = analytics.symptomPatterns.slice(0, 5).map((pattern) => ({
    label: pattern.symptom.length > 8 ? pattern.symptom.substring(0, 8) + '...' : pattern.symptom,
    value: pattern.frequency,
    color: colors.fertile,
  }));

  const moodChartData = analytics.moodTrends.slice(0, 5).map((mood) => ({
    label: mood.mood.length > 8 ? mood.mood.substring(0, 8) + '...' : mood.mood,
    value: mood.frequency,
    color: colors.ovulation,
  }));

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
        <Text className="text-2xl font-bold text-text-primary">
          Análisis Avanzado
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings')}
          className="h-10 w-10 items-center justify-center rounded-full bg-background"
        >
          <MyIcon name="Settings" className="text-text-primary" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-24" />

        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white rounded-3xl p-4 border border-gray-200 shadow-md">
            <Text className="text-sm text-text-muted mb-1">Ciclos Promedio</Text>
            <Text className="text-2xl font-bold text-text-primary">
              {analytics.averageCycleLength}
            </Text>
            <Text className="text-xs text-text-muted">días</Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl p-4 border border-gray-200 shadow-md">
            <Text className="text-sm text-text-muted mb-1">Periodo Promedio</Text>
            <Text className="text-2xl font-bold text-text-primary">
              {analytics.averagePeriodLength}
            </Text>
            <Text className="text-xs text-text-muted">días</Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-3xl p-4 border border-gray-200 shadow-md">
            <Text className="text-sm text-text-muted mb-1">Regularidad</Text>
            <Text className="text-2xl font-bold text-text-primary">
              {analytics.cycleRegularityScore}
            </Text>
            <Text className="text-xs text-text-muted">%</Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl p-4 border border-gray-200 shadow-md">
            <Text className="text-sm text-text-muted mb-1">Total Ciclos</Text>
            <Text className="text-2xl font-bold text-text-primary">
              {analytics.totalCycles}
            </Text>
            <Text className="text-xs text-text-muted">registrados</Text>
          </View>
        </View>

        {/* Cycle Length Trend */}
        {cycleChartData.length > 0 && (
          <View className="bg-white rounded-3xl p-5 mb-4 border border-gray-200 shadow-md">
            <View className="flex-row items-center gap-2 mb-4">
              <MyIcon name="TrendingUp" className="text-primary" size={20} />
              <Text className="text-lg font-bold text-text-primary">
                Tendencia de Longitud del Ciclo
              </Text>
            </View>
            <SimpleBarChart data={cycleChartData} height={150} />
            <Text className="text-xs text-text-muted mt-2 text-center">
              Últimos {cycleChartData.length} ciclos
            </Text>
          </View>
        )}

        {/* Period Length Trend */}
        {periodChartData.length > 0 && (
          <View className="bg-white rounded-3xl p-5 mb-4 border border-gray-200 shadow-md">
            <View className="flex-row items-center gap-2 mb-4">
              <MyIcon name="Droplet" className="text-rose-500" size={20} />
              <Text className="text-lg font-bold text-text-primary">
                Tendencia de Duración del Periodo
              </Text>
            </View>
            <SimpleBarChart data={periodChartData} height={150} />
            <Text className="text-xs text-text-muted mt-2 text-center">
              Últimos {periodChartData.length} ciclos
            </Text>
          </View>
        )}

        {/* Symptom Patterns */}
        {symptomChartData.length > 0 && (
          <View className="bg-white rounded-3xl p-5 mb-4 border border-gray-200 shadow-md">
            <View className="flex-row items-center gap-2 mb-4">
              <MyIcon name="Activity" className="text-green-500" size={20} />
              <Text className="text-lg font-bold text-text-primary">
                Síntomas Más Frecuentes
              </Text>
            </View>
            <SimpleBarChart data={symptomChartData} height={150} />
            <View className="mt-4 gap-2">
              {analytics.symptomPatterns.slice(0, 5).map((pattern, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <Text className="text-sm text-text-primary flex-1">
                    {pattern.symptom}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-text-muted">
                      {pattern.frequency}x
                    </Text>
                    <View className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-green-500"
                        style={{ width: `${pattern.percentage}%` }}
                      />
                    </View>
                    <Text className="text-xs text-text-muted w-10 text-right">
                      {pattern.percentage}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mood Trends */}
        {moodChartData.length > 0 && (
          <View className="bg-white rounded-3xl p-5 mb-4 border border-gray-200 shadow-md">
            <View className="flex-row items-center gap-2 mb-4">
              <MyIcon name="Smile" className="text-purple-500" size={20} />
              <Text className="text-lg font-bold text-text-primary">
                Estados de Ánimo
              </Text>
            </View>
            <SimpleBarChart data={moodChartData} height={150} />
            <View className="mt-4 gap-2">
              {analytics.moodTrends.slice(0, 5).map((mood, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <Text className="text-sm text-text-primary flex-1">
                    {mood.mood}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-text-muted">
                      {mood.frequency}x
                    </Text>
                    <View className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-purple-500"
                        style={{ width: `${mood.percentage}%` }}
                      />
                    </View>
                    <Text className="text-xs text-text-muted w-10 text-right">
                      {mood.percentage}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Date Range */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <Text className="text-xs text-text-muted text-center">
            Datos desde {formatDate(analytics.dateRange.start, 'long')} hasta{' '}
            {formatDate(analytics.dateRange.end, 'long')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

