import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';

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

export default function OnboardingSymptomsScreen() {
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

  const handleSkip = () => {
    updateData({ symptoms: undefined });
    router.push('/onboarding/pregnancy');
  };

  const handleContinue = () => {
    router.push('/onboarding/pregnancy');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.moonWhite }}>
      {/* Top App Bar */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.moonWhite }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', paddingRight: 40 }}>
            Paso 2 de 5
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textMuted }}>Síntomas comunes</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textMuted }}>40%</Text>
          </View>
          <View style={{ height: 4, width: '100%', borderRadius: 9999, backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: colors.lavender, borderRadius: 9999, width: '40%' }} />
          </View>
        </View>
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
        <View style={{ height: 160, backgroundColor: 'transparent', width: '100%' }} />
      </ScrollView>

      {/* Footer / Bottom Navigation */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.moonWhite,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={handleSkip}
            style={{
              flex: 1,
              height: 56,
              backgroundColor: 'transparent',
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 18, fontWeight: '600' }}>Omitir</Text>
          </Pressable>
          <Pressable
            onPress={handleContinue}
            style={{
              flex: 1,
              height: 56,
              backgroundColor: colors.lavender,
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700' }}>Continuar</Text>
            <ArrowRight size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
