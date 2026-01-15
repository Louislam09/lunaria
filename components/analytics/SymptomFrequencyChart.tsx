import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { colors } from '@/utils/colors';
import { SymptomFrequency } from '@/utils/analytics';

interface SymptomFrequencyChartProps {
  data: SymptomFrequency[];
  title?: string;
}

export function SymptomFrequencyChart({ data, title = 'Frecuencia de síntomas' }: SymptomFrequencyChartProps) {
  if (data.length === 0) {
    return (
      <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
        <Text className="text-lg font-bold text-text-primary mb-4">{title}</Text>
        <View className="h-48 items-center justify-center">
          <Text className="text-text-muted">No hay síntomas registrados</Text>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 64;
  
  // Take top 8 symptoms to avoid overcrowding
  const topSymptoms = data.slice(0, 8);

  const chartData = {
    labels: topSymptoms.map(s => {
      // Truncate long symptom names
      if (s.symptom.length > 10) {
        return s.symptom.substring(0, 8) + '...';
      }
      return s.symptom;
    }),
    datasets: [
      {
        data: topSymptoms.map(s => s.count),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => colors.period,
    labelColor: (opacity = 1) => `rgba(46, 42, 56, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
    barPercentage: 0.6,
  };

  return (
    <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
      <Text className="text-lg font-bold text-text-primary mb-4">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData}
          width={Math.max(screenWidth, topSymptoms.length * 50)}
          height={220}
          chartConfig={chartConfig}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          segments={4}
          showValuesOnTopOfBars
          fromZero
        />
      </ScrollView>
      <View className="mt-2">
        <Text className="text-xs text-text-muted text-center">
          Número de veces que se registró cada síntoma
        </Text>
      </View>
    </View>
  );
}
