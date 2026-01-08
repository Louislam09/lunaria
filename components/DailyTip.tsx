import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import MyIcon from '@/components/ui/Icon';
import { getCycleDayTip } from '@/constants/cycleDayTips';

export interface DailyTipProps {
  /**
   * Current day of the cycle (1-based)
   */
  cycleDay: number;
  /**
   * Optional date for tip rotation (defaults to today)
   */
  date?: Date;
  /**
   * Optional title for the section (defaults to "Tip del día")
   */
  title?: string;
  /**
   * Whether to show the section title (defaults to true)
   */
  showTitle?: boolean;
  /**
   * Custom className for the container
   */
  containerClassName?: string;
  /**
   * Custom className for the card
   */
  cardClassName?: string;
}

/**
 * Reusable component that displays a daily tip based on the cycle day
 */
export function DailyTip({
  cycleDay,
  date,
  title = 'Tip del día',
  showTitle = true,
  containerClassName,
  cardClassName,
}: DailyTipProps) {
  const dailyTip = useMemo(() => {
    if (!cycleDay || cycleDay < 1) return null;
    const tipDate = date || new Date();
    return getCycleDayTip(cycleDay, tipDate);
  }, [cycleDay, date]);

  if (!dailyTip) {
    return null;
  }

  return (
    <View className={containerClassName || 'mt-8'}>
      {showTitle && (
        <Text className="mb-4 text-xl font-bold text-text-primary">
          {title}
        </Text>
      )}
      <View className={cardClassName || 'bg-white p-5 rounded-3xl border border-gray-100 shadow-md'}>
        <View className={`h-12 w-12 rounded-full ${dailyTip.iconBg} items-center justify-center mb-3`}>
          <MyIcon name={dailyTip.icon as any} size={24} className={`${dailyTip.iconColor} fill-current`} />
        </View>
        <Text className="text-lg font-bold text-text-primary mb-2">
          {dailyTip.title}
        </Text>
        <Text className="text-text-muted leading-5">
          {dailyTip.text}
        </Text>
      </View>
    </View>
  );
}

