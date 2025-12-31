import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/utils/colors';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

export function SimpleBarChart({
  data,
  maxValue,
  height = 150,
  showValues = true,
}: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <View className="flex-row items-end justify-between gap-2" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = max > 0 ? (item.value / max) * height : 0;
        const barColor = item.color || colors.lavender;

        return (
          <View key={index} className="flex-1 items-center gap-2">
            <View className="w-full items-center justify-end" style={{ height }}>
              <View
                className="w-full rounded-t-lg"
                style={{
                  height: Math.max(barHeight, 4),
                  backgroundColor: barColor,
                  minHeight: item.value > 0 ? 4 : 0,
                }}
              />
            </View>
            {showValues && (
              <Text className="text-xs font-semibold text-text-primary">
                {item.value}
              </Text>
            )}
            <Text className="text-xs text-text-muted text-center" numberOfLines={2}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

