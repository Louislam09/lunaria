import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/utils/colors';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export default function OnboardingProgress({ currentStep, totalSteps = 4 }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isFilled = index < currentStep;
          return (
            <View
              key={index}
              style={[
                styles.segment,
                isFilled ? styles.segmentFilled : styles.segmentEmpty,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  segmentFilled: {
    backgroundColor: colors.lavender,
  },
  segmentEmpty: {
    backgroundColor: '#e2e8f0',
  },
});

