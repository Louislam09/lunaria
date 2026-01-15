import React from 'react';
import { View, Text } from 'react-native';
import MyIcon from '@/components/ui/Icon';
import { CycleStatistics } from '@/utils/analytics';

interface CycleStatsCardProps {
  stats: CycleStatistics;
}

export function CycleStatsCard({ stats }: CycleStatsCardProps) {
  const getRegularityColor = (score: string) => {
    switch (score) {
      case 'regular':
        return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
      case 'somewhat-regular':
        return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
      case 'irregular':
        return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const getRegularityLabel = (score: string) => {
    switch (score) {
      case 'regular':
        return 'Regular';
      case 'somewhat-regular':
        return 'Algo regular';
      case 'irregular':
        return 'Irregular';
      default:
        return 'No determinado';
    }
  };

  const regularityStyle = getRegularityColor(stats.regularityScore);

  return (
    <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
          <MyIcon name="Activity" size={20} className="text-primary" />
        </View>
        <Text className="text-lg font-bold text-text-primary">Estadísticas del Ciclo</Text>
      </View>

      <View className="gap-4">
        {/* Cycle Length Stats */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-text-muted uppercase">Duración del Ciclo</Text>
          <View className="flex-row items-baseline gap-2">
            <Text className="text-3xl font-bold text-text-primary">{stats.averageCycleLength}</Text>
            <Text className="text-base text-text-muted">días</Text>
          </View>
          <View className="flex-row gap-4 mt-1">
            <View className="flex-1">
              <Text className="text-xs text-text-muted">Mínimo</Text>
              <Text className="text-sm font-semibold text-text-primary">{stats.minCycleLength} días</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-text-muted">Máximo</Text>
              <Text className="text-sm font-semibold text-text-primary">{stats.maxCycleLength} días</Text>
            </View>
          </View>
        </View>

        {/* Period Duration Stats */}
        <View className="gap-2 pt-3 border-t border-gray-100">
          <Text className="text-sm font-semibold text-text-muted uppercase">Duración del Periodo</Text>
          <View className="flex-row items-baseline gap-2">
            <Text className="text-3xl font-bold text-text-primary">{stats.averagePeriodDuration}</Text>
            <Text className="text-base text-text-muted">días</Text>
          </View>
          <View className="flex-row gap-4 mt-1">
            <View className="flex-1">
              <Text className="text-xs text-text-muted">Mínimo</Text>
              <Text className="text-sm font-semibold text-text-primary">{stats.minPeriodDuration} días</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-text-muted">Máximo</Text>
              <Text className="text-sm font-semibold text-text-primary">{stats.maxPeriodDuration} días</Text>
            </View>
          </View>
        </View>

        {/* Regularity */}
        <View className="gap-2 pt-3 border-t border-gray-100">
          <Text className="text-sm font-semibold text-text-muted uppercase">Regularidad</Text>
          <View className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border ${regularityStyle.bg} ${regularityStyle.border}`}>
            <Text className={`text-base font-bold ${regularityStyle.text}`}>
              {getRegularityLabel(stats.regularityScore)}
            </Text>
            {stats.totalCycles > 0 && (
              <Text className="text-xs text-text-muted">
                ({stats.totalCycles} ciclo{stats.totalCycles > 1 ? 's' : ''} analizado{stats.totalCycles > 1 ? 's' : ''})
              </Text>
            )}
          </View>
          {stats.cycleRegularity > 0 && (
            <Text className="text-xs text-text-muted mt-1">
              Desviación estándar: {stats.cycleRegularity} días
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
