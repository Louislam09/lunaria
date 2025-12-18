import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['abdominal_pain', 'sensitivity']);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  return (
    <View className="flex-1 bg-[#f8f6f6]">
      {/* Top Navigation & Progress */}
      <View className="flex flex-col gap-4 px-6 pt-12 pb-2 w-full z-20 bg-[#f8f6f6]/95 backdrop-blur-sm sticky top-0" style={{ paddingTop: insets.top + 48 }}>
        <View className="flex-row items-center justify-between w-full">
          <Pressable onPress={() => router.back()}>
            <View className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <Text className="text-[20px]">←</Text>
            </View>
          </Pressable>
          <Pressable>
            <Text className="px-3 py-1.5 rounded-full text-sm font-bold text-gray-500">Omitir</Text>
          </Pressable>
        </View>

        {/* Segmented Progress Indicator */}
        <View className="flex-row w-full gap-1.5 mt-2">
          <View className="h-1.5 flex-1 rounded-full bg-[#ea3e77]/30" />
          <View className="h-1.5 flex-1 rounded-full bg-[#ea3e77]/30" />
          <View className="h-1.5 flex-1 rounded-full bg-[#ea3e77]" />
          <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
          <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
        </View>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView className="flex-1 overflow-y-auto px-6 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        {/* Header Text */}
        <View className="mb-8 mt-2">
          <Text className="text-[28px] leading-[1.2] font-extrabold text-[#181113] mb-3">
            ¿Cuáles son tus síntomas más comunes?
          </Text>
          <Text className="text-base text-gray-500 font-medium leading-relaxed">
            Selecciona todo lo que aplique para mejorar tus predicciones mensuales.
          </Text>
        </View>

        {/* Symptoms Grid */}
        <View className="grid grid-cols-2 gap-3 flex-row flex-wrap">
          {symptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <Pressable
                key={symptom.id}
                onPress={() => toggleSymptom(symptom.id)}
                className={`group relative flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-[#ea3e77]'
                    : 'ring-1 ring-transparent'
                } w-[48%] mb-3`}
              >
                <View className="flex-row w-full justify-between items-start">
                  <View className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    isSelected
                      ? 'bg-[#ea3e77]/10'
                      : 'bg-gray-100'
                  }`}>
                    <Text className="text-2xl">{symptom.icon}</Text>
                  </View>
                  {isSelected ? (
                    <Text className="text-[#ea3e77] text-[22px]">✓</Text>
                  ) : (
                    <View className="h-5 w-5 rounded-full border-2 border-gray-200" />
                  )}
                </View>
                <Text className="text-[15px] font-bold text-[#181113] leading-tight">
                  {symptom.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View className="absolute bottom-0 w-full bg-gradient-to-t from-[#f8f6f6] via-[#f8f6f6] to-transparent pt-12 pb-8 px-6 z-10" style={{ paddingBottom: insets.bottom + 32 }}>
        {/* Privacy Note */}
        <View className="flex-row items-center justify-center gap-2 mb-4 opacity-60">
          <Text className="text-[16px]">🔒</Text>
          <Text className="text-xs font-medium text-[#181113] tracking-wide">
            Tus datos se guardan solo en tu dispositivo
          </Text>
        </View>

        <Link href="/home" asChild>
          <Pressable className="flex w-full items-center justify-center overflow-hidden rounded-full h-14 bg-[#ea3e77] shadow-lg">
            <Text className="tracking-wide text-white text-[17px] font-bold">Continuar</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

