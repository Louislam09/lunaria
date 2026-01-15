import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import MyIcon from '@/components/ui/Icon';
import { SymptomPattern } from '@/utils/patternDetection';

interface PatternInsightCardProps {
  patterns: SymptomPattern[];
  title?: string;
}

export function PatternInsightCard({ patterns, title = 'Patrones Detectados' }: PatternInsightCardProps) {
  if (patterns.length === 0) {
    return (
      <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
            <MyIcon name="Sparkles" size={20} className="text-purple-600" />
          </View>
          <Text className="text-lg font-bold text-text-primary">{title}</Text>
        </View>
        <View className="h-32 items-center justify-center">
          <Text className="text-text-muted text-center">
            No se han detectado patrones aún.{'\n'}
            Continúa registrando tus síntomas para descubrir patrones.
          </Text>
        </View>
      </View>
    );
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
      case 'medium':
        return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
      case 'low':
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'Alta confianza';
      case 'medium':
        return 'Confianza media';
      case 'low':
        return 'Baja confianza';
      default:
        return 'Confianza';
    }
  };

  return (
    <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
          <MyIcon name="Sparkles" size={20} className="text-purple-600" />
        </View>
        <Text className="text-lg font-bold text-text-primary">{title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-3">
          {patterns.map((pattern, index) => {
            const confidenceStyle = getConfidenceColor(pattern.confidence);
            
            return (
              <View
                key={index}
                className={`p-4 rounded-2xl border ${confidenceStyle.bg} ${confidenceStyle.border}`}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-text-primary mb-1">
                      {pattern.symptom}
                    </Text>
                    <Text className="text-sm text-text-muted">
                      {pattern.description}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-lg ${confidenceStyle.bg} border ${confidenceStyle.border}`}>
                    <Text className={`text-xs font-semibold ${confidenceStyle.text}`}>
                      {getConfidenceLabel(pattern.confidence)}
                    </Text>
                  </View>
                </View>
                <View className="mt-2 pt-2 border-t border-gray-200">
                  <Text className="text-xs text-text-muted">
                    Detectado {pattern.frequency} vez{pattern.frequency > 1 ? 'es' : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
