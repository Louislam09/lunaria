import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingPregnancyScreen() {
  const insets = useSafeAreaInsets();
  const [wantsPregnancy, setWantsPregnancy] = useState<'yes' | 'no'>('no');

  return (
    <View className="flex-1 bg-[#f8f6f6]">
      {/* Top Navigation */}
      <View className="flex-row items-center p-6 pb-2 justify-between" style={{ paddingTop: insets.top + 16 }}>
        <Pressable onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-sm font-medium text-gray-500">Paso 2 de 5</Text>
      </View>

      {/* Progress Indicators */}
      <View className="flex-row items-center justify-center gap-2 py-4 px-6">
        <View className="h-1.5 w-8 rounded-full bg-[#ea3e77]" />
        <View className="h-1.5 w-8 rounded-full bg-[#ea3e77]" />
        <View className="h-1.5 w-8 rounded-full bg-gray-200" />
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
            Personalizaremos tu calendario y predicciones según tu objetivo actual.
          </Text>
        </View>

        {/* Selection Cards */}
        <View className="flex flex-col gap-4 flex-1">
          {/* Option 1: Yes */}
          <Pressable
            onPress={() => setWantsPregnancy('yes')}
            className={`relative flex-row items-center gap-5 rounded-2xl bg-white p-5 shadow-sm border-2 ${
              wantsPregnancy === 'yes'
                ? 'border-[#ea3e77] bg-[#ea3e77]/5'
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
              wantsPregnancy === 'yes'
                ? 'border-[#ea3e77] bg-[#ea3e77]'
                : 'border-gray-300'
            } flex items-center justify-center`}>
              {wantsPregnancy === 'yes' && (
                <Text className="text-white text-[16px] font-bold">✓</Text>
              )}
            </View>
          </Pressable>

          {/* Option 2: No */}
          <Pressable
            onPress={() => setWantsPregnancy('no')}
            className={`relative flex-row items-center gap-5 rounded-2xl bg-white p-5 shadow-sm border-2 ${
              wantsPregnancy === 'no'
                ? 'border-[#ea3e77] bg-[#ea3e77]/5'
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
              wantsPregnancy === 'no'
                ? 'border-[#ea3e77] bg-[#ea3e77]'
                : 'border-gray-300'
            } flex items-center justify-center`}>
              {wantsPregnancy === 'no' && (
                <Text className="text-white text-[16px] font-bold">✓</Text>
              )}
            </View>
          </Pressable>
        </View>

        {/* Spacer */}
        <View className="flex-grow min-h-[40px]" />

        {/* Bottom Action */}
        <View style={{ paddingBottom: insets.bottom + 16 }}>
          <Link href="/onboarding/contraceptive" asChild>
            <Pressable className="w-full rounded-full bg-[#ea3e77] py-4 px-6 text-center shadow-lg">
              <Text className="text-white text-lg font-bold text-center">Continuar</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

