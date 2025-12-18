import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding, ContraceptiveMethod } from '@/context/OnboardingContext';

const contraceptiveMethods: { id: ContraceptiveMethod; label: string; icon: string }[] = [
  { id: 'none', label: 'Ninguno', icon: '🚫' },
  { id: 'condom', label: 'Condón', icon: '🛡️' },
  { id: 'pill', label: 'Pastillas', icon: '💊' },
  { id: 'injection', label: 'Inyección', icon: '💉' },
  { id: 'implant', label: 'Implante', icon: '📏' },
  { id: 'iud_hormonal', label: 'DIU hormonal', icon: '⚓' },
  { id: 'iud_copper', label: 'DIU de cobre', icon: '⚓' },
  { id: 'other', label: 'Otro', icon: '➕' },
];

export default function OnboardingContraceptiveScreen() {
  const insets = useSafeAreaInsets();
  const { data, updateData } = useOnboarding();
  const [selectedMethod, setSelectedMethod] = useState<ContraceptiveMethod | undefined>(
    data.contraceptiveMethod || 'none'
  );

  useEffect(() => {
    if (selectedMethod !== undefined) {
      updateData({ contraceptiveMethod: selectedMethod });
    }
  }, [selectedMethod]);

  const handleSkip = () => {
    updateData({ contraceptiveMethod: undefined });
    handleFinish();
  };

  const handleFinish = () => {
    // The completion check happens automatically in updateData
    // Navigate to tabs - if onboarding is complete, index.tsx will handle it
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-[#f8f5f6]">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between p-4 sticky top-0 z-10 bg-[#f8f5f6]" style={{ paddingTop: insets.top + 16 }}>
        <Pressable onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </Pressable>
        <View className="flex flex-col items-center">
          <Text className="text-xs font-medium text-gray-500 tracking-wide uppercase">Paso 5 de 5</Text>
        </View>
        <Pressable onPress={handleSkip}>
          <Text className="text-sm font-medium text-gray-500">Omitir</Text>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="px-6 pb-2 w-full">
        <View className="flex-row w-full gap-2">
          <View className="h-1.5 flex-1 rounded-full bg-[#256af4]" />
          <View className="h-1.5 flex-1 rounded-full bg-[#256af4]" />
          <View className="h-1.5 flex-1 rounded-full bg-[#256af4]" />
          <View className="h-1.5 flex-1 rounded-full bg-[#256af4]" />
          <View className="h-1.5 flex-1 rounded-full bg-[#256af4]" />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6 pt-4 pb-24" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Text Section */}
        <View className="mb-8">
          <Text className="text-[#181113] text-3xl font-bold leading-tight mb-3">
            ¿Usas algún método anticonceptivo?
          </Text>
          <Text className="text-gray-600 text-base font-normal leading-relaxed">
            Esto nos ayuda a mejorar tus predicciones y personalizar tu experiencia. Este paso es opcional.
          </Text>
        </View>

        {/* Options Grid */}
        <View className="grid grid-cols-2 gap-4 flex-row flex-wrap">
          {contraceptiveMethods.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => setSelectedMethod(method.id)}
              className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white shadow-sm border-2 ${
                selectedMethod === method.id
                  ? 'border-[#256af4]'
                  : 'border-transparent'
              } w-[48%] mb-4`}
            >
              <View className={`size-12 rounded-full ${
                selectedMethod === method.id
                  ? 'bg-[#256af4]/10'
                  : 'bg-gray-100'
              } flex items-center justify-center`}>
                <Text className="text-2xl">{method.icon}</Text>
              </View>
              <Text className={`text-sm font-medium text-center ${
                selectedMethod === method.id
                  ? 'text-[#256af4]'
                  : 'text-[#181113]'
              }`}>
                {method.label}
              </Text>
              {selectedMethod === method.id && (
                <View className="absolute top-3 right-3">
                  <Text className="text-[#256af4] text-xl">✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="fixed bottom-0 left-0 w-full p-4 bg-[#f8f5f6]/95 backdrop-blur-md border-t border-gray-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <Pressable
          onPress={handleFinish}
          className="w-full h-14 bg-[#256af4] text-white text-lg font-semibold rounded-2xl shadow-lg flex-row items-center justify-center gap-2"
        >
          <Text className="text-white text-lg font-semibold">Finalizar</Text>
          <Text className="text-white text-xl">→</Text>
        </Pressable>
      </View>
    </View>
  );
}
