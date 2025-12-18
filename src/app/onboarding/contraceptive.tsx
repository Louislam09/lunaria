import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const contraceptiveMethods = [
  { id: 'none', label: 'Ninguno', icon: '🚫' },
  { id: 'condom', label: 'Condón', icon: '🛡️' },
  { id: 'pills', label: 'Pastillas', icon: '💊' },
  { id: 'injection', label: 'Inyección', icon: '💉' },
  { id: 'implant', label: 'Implante', icon: '📏' },
  { id: 'hormonal_iud', label: 'DIU hormonal', icon: '⚓' },
  { id: 'copper_iud', label: 'DIU de cobre', icon: '⚓' },
  { id: 'other', label: 'Otro', icon: '➕' },
];

export default function OnboardingContraceptiveScreen() {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<string>('pills');

  return (
    <View className="flex-1 bg-[#f8f5f6]">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between p-4 sticky top-0 z-10 bg-[#f8f5f6]" style={{ paddingTop: insets.top + 16 }}>
        <Pressable onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </Pressable>
        <View className="flex flex-col items-center">
          <Text className="text-xs font-medium text-gray-500 tracking-wide uppercase">Paso 3 de 5</Text>
        </View>
        <Pressable>
          <Text className="text-sm font-medium text-gray-500">Omitir</Text>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="px-6 pb-2 w-full">
        <View className="flex-row w-full gap-2">
          <View className="h-1.5 flex-1 rounded-full bg-[#f53d7a]" />
          <View className="h-1.5 flex-1 rounded-full bg-[#f53d7a]" />
          <View className="h-1.5 flex-1 rounded-full bg-[#f53d7a]" />
          <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
          <View className="h-1.5 flex-1 rounded-full bg-gray-200" />
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
            Esto nos ayuda a mejorar tus predicciones y personalizar tu experiencia.
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
                  ? 'border-[#f53d7a]'
                  : 'border-transparent'
              } w-[48%] mb-4`}
            >
              <View className={`size-12 rounded-full ${
                selectedMethod === method.id
                  ? 'bg-[#f53d7a]/10'
                  : 'bg-gray-100'
              } flex items-center justify-center`}>
                <Text className="text-2xl">{method.icon}</Text>
              </View>
              <Text className={`text-sm font-medium text-center ${
                selectedMethod === method.id
                  ? 'text-[#f53d7a]'
                  : 'text-[#181113]'
              }`}>
                {method.label}
              </Text>
              {selectedMethod === method.id && (
                <View className="absolute top-3 right-3">
                  <Text className="text-[#f53d7a] text-xl">✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="fixed bottom-0 left-0 w-full p-4 bg-[#f8f5f6]/95 backdrop-blur-md border-t border-gray-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <Link href="/onboarding/symptoms" asChild>
          <Pressable className="w-full h-14 bg-[#f53d7a] text-white text-lg font-semibold rounded-2xl shadow-lg flex-row items-center justify-center gap-2">
            <Text className="text-white text-lg font-semibold">Continuar</Text>
            <Text className="text-white text-xl">→</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

