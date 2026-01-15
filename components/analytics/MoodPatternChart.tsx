import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { colors } from '@/utils/colors';
import { MoodFrequency } from '@/utils/analytics';

interface MoodPatternChartProps {
  data: MoodFrequency[];
  title?: string;
}

const MOOD_COLORS = [
  colors.lavender,
  colors.period,
  colors.fertile,
  colors.ovulation,
  '#F3B7C6',
  '#4BAA4E',
  '#c58ffc',
  '#fb7185',
];

export function MoodPatternChart({ data, title = 'Distribución de estados de ánimo' }: MoodPatternChartProps) {
  if (data.length === 0) {
    return (
      <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
        <Text className="text-lg font-bold text-text-primary mb-4">{title}</Text>
        <View className="h-48 items-center justify-center">
          <Text className="text-text-muted">No hay estados de ánimo registrados</Text>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 64;

  // Prepare pie chart data
  const pieData = data.map((mood, index) => ({
    name: mood.mood,
    population: mood.count,
    color: MOOD_COLORS[index % MOOD_COLORS.length],
    legendFontColor: colors.textPrimary,
    legendFontSize: 12,
  }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(177, 159, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(46, 42, 56, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
      <Text className="text-lg font-bold text-text-primary mb-4">{title}</Text>
      <PieChart
        data={pieData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <View className="mt-2">
        <Text className="text-xs text-text-muted text-center">
          Distribución de estados de ánimo registrados
        </Text>
      </View>
    </View>
  );
}
