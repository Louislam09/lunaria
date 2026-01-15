import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '@/utils/colors';
import { formatDate } from '@/utils/dates';

interface TrendChartProps {
  data: Array<{ date: string; cycleLength: number; periodDuration: number }>;
  type: 'cycle' | 'period';
  title: string;
}

export function TrendChart({ data, type, title }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
        <Text className="text-lg font-bold text-text-primary mb-4">{title}</Text>
        <View className="h-48 items-center justify-center">
          <Text className="text-text-muted">No hay datos suficientes para mostrar</Text>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 64; // Account for padding

  // Prepare chart data
  const chartData = {
    labels: data.map((item, index) => {
      // Show only first, middle, and last labels to avoid crowding
      if (data.length <= 3) return formatDate(new Date(item.date), 'short');
      if (index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1) {
        return formatDate(new Date(item.date), 'short');
      }
      return '';
    }),
    datasets: [
      {
        data: data.map(item => type === 'cycle' ? item.cycleLength : item.periodDuration),
        color: (opacity = 1) => colors.lavender,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(177, 159, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(46, 42, 56, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.lavender,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
  };

  return (
    <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
      <Text className="text-lg font-bold text-text-primary mb-4">{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLabels={true}
        withVerticalLabels={false}
        segments={4}
      />
      <View className="mt-2">
        <Text className="text-xs text-text-muted text-center">
          {type === 'cycle' ? 'Duración del ciclo (días)' : 'Duración del periodo (días)'}
        </Text>
      </View>
    </View>
  );
}
