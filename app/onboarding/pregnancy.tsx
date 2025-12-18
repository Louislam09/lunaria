import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';

export default function OnboardingPregnancyScreen() {
  const insets = useSafeAreaInsets();
  const { data, updateData } = useOnboarding();
  const [wantsPregnancy, setWantsPregnancy] = useState<boolean | undefined>(data.wantsPregnancy);

  useEffect(() => {
    if (wantsPregnancy !== undefined) {
      updateData({ wantsPregnancy });
    }
  }, [wantsPregnancy]);

  const handleSkip = () => {
    updateData({ wantsPregnancy: undefined });
    router.push('/onboarding/contraceptive');
  };

  const handleContinue = () => {
    router.push('/onboarding/contraceptive');
  };

  return (
    <View className="flex-1 bg-[#f8f6f6]">
      {/* Top Navigation */}
      <View className="flex-row items-center p-6 pb-2 justify-between" style={{ paddingTop: insets.top + 16 }}>
        <Pressable onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-sm font-medium text-gray-500">Paso 3 de 5</Text>
        <Pressable onPress={handleSkip}>
          <Text className="text-sm font-medium text-gray-500">Omitir</Text>
        </Pressable>
      </View>

      {/* Progress Indicators */}
      <View className="flex-row items-center justify-center gap-2 py-4 px-6">
        <View className="h-1.5 w-8 rounded-full bg-[#256af4]" />
        <View className="h-1.5 w-8 rounded-full bg-[#256af4]" />
        <View className="h-1.5 w-8 rounded-full bg-[#256af4]" />
        <View className="h-1.5 w-8 rounded-full bg-gray-200" />
        <View className="h-1.5 w-8 rounded-full bg-gray-200" />
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6 pt-4 pb-8" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Headline Group */}
        <View className="mb-8">
          <Text className="text-[#181113] tracking-tight text-[32px] font-extrabold leading-[1.2] pb-3 text-center">
            ¿Buscas un embarazo?
          </Text>
          <Text className="text-gray-600 text-base font-medium leading-relaxed text-center">
            Personalizaremos tu calendario y predicciones según tu objetivo actual. Este paso es opcional.
          </Text>
        </View>

        {/* Selection Cards */}
        <View className="flex flex-col gap-4 flex-1">
          {/* Option 1: Yes */}
          <Pressable
            onPress={() => setWantsPregnancy(true)}
            className={`relative flex-row items-center gap-5 rounded-2xl bg-white p-5 shadow-sm border-2 ${
              wantsPregnancy === true
                ? 'border-[#256af4] bg-[#256af4]/5'
                : 'border-transparent'
            }`}
          >
            {/* Icon Box */}
            <View className="flex size-14 shrink-0 items-center justify-center rounded-full bg-red-50">
              <Text className="text-[28px]">👶</Text>
            </View>
            {/* Text Content */}
            <View className="flex flex-col gap-1 flex-1">
              <Text className="text-[#181113] text-lg font-bold leading-tight">
                Sí, busco un embarazo
              </Text>
              <Text className="text-gray-500 text-sm font-normal">
                Quiero concebir pronto
              </Text>
            </View>
            {/* Check Indicator */}
            <View className={`size-6 rounded-full border-2 ${
              wantsPregnancy === true
                ? 'border-[#256af4] bg-[#256af4]'
                : 'border-gray-300'
            } flex items-center justify-center`}>
              {wantsPregnancy === true && (
                <Text className="text-white text-[16px] font-bold">✓</Text>
              )}
            </View>
          </Pressable>

          {/* Option 2: No */}
          <Pressable
            onPress={() => setWantsPregnancy(false)}
            className={`relative flex-row items-center gap-5 rounded-2xl bg-white p-5 shadow-sm border-2 ${
              wantsPregnancy === false
                ? 'border-[#256af4] bg-[#256af4]/5'
                : 'border-transparent'
            }`}
          >
            {/* Icon Box */}
            <View className="flex size-14 shrink-0 items-center justify-center rounded-full bg-purple-50">
              <Text className="text-[28px]">📅</Text>
            </View>
            {/* Text Content */}
            <View className="flex flex-col gap-1 flex-1">
              <Text className="text-[#181113] text-lg font-bold leading-tight">
                No, solo monitorear
              </Text>
              <Text className="text-gray-500 text-sm font-normal">
                Controlar mi ciclo y salud
              </Text>
            </View>
            {/* Check Indicator */}
            <View className={`size-6 rounded-full border-2 ${
              wantsPregnancy === false
                ? 'border-[#256af4] bg-[#256af4]'
                : 'border-gray-300'
            } flex items-center justify-center`}>
              {wantsPregnancy === false && (
                <Text className="text-white text-[16px] font-bold">✓</Text>
              )}
            </View>
          </Pressable>
        </View>

        {/* Spacer */}
        <View className="flex-grow min-h-[40px]" />

        {/* Bottom Action */}
        <View style={{ paddingBottom: insets.bottom + 16 }}>
          <Pressable
            onPress={handleContinue}
            className="w-full rounded-full bg-[#256af4] py-4 px-6 text-center shadow-lg"
          >
            <Text className="text-white text-lg font-bold text-center">Continuar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
