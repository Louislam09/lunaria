import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import OnboardingProgress from '@/components/ui/OnboardingProgress';

const symptoms = [
  { id: 'abdominal_pain', label: 'Dolor abdominal', icon: '🫄' },
  { id: 'back_pain', label: 'Dolor de espalda', icon: '🩹' },
  { id: 'nausea', label: 'Náuseas', icon: '🤢' },
  { id: 'mood_changes', label: 'Cambios de humor', icon: '😢' },
  { id: 'sensitivity', label: 'Sensibilidad', icon: '💧' },
  { id: 'fatigue', label: 'Fatiga', icon: '⚡' },
  { id: 'acne', label: 'Acné', icon: '😐' },
  { id: 'cravings', label: 'Antojos', icon: '🍦' },
];

export default function Step2() {
  const insets = useSafeAreaInsets();
  const { data, updateData } = useOnboarding();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(data.symptoms || []);

  useEffect(() => {
    updateData({ symptoms: selectedSymptoms });
  }, [selectedSymptoms]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.moonWhite }}>
      {/* Top App Bar */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.moonWhite }}>
        <OnboardingProgress currentStep={2} />
      </View>

      {/* Main Scrollable Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 128, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {/* Header Text */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 30, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary, marginBottom: 8 }}>
            ¿Cuáles son tus síntomas más comunes?
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 24 }}>
            Selecciona todo lo que aplique para mejorar tus predicciones mensuales. Este paso es opcional.
          </Text>
        </View>

        {/* Symptoms Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {symptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <Pressable
                key={symptom.id}
                onPress={() => toggleSymptom(symptom.id)}
                style={{
                  width: '48%',
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: '#ffffff',
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.lavender : '#e2e8f0',
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isSelected ? `${colors.lavender}1A` : '#f1f5f9',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 24 }}>{symptom.icon}</Text>
                  </View>
                  {isSelected ? (
                    <Text style={{ fontSize: 20, color: colors.lavender }}>✓</Text>
                  ) : (
                    <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0' }} />
                  )}
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
                  {symptom.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: 200, backgroundColor: 'transparent', width: '100%' }} />
      </ScrollView>
    </View>
  );
}
