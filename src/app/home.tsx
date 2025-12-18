import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateNextPeriod, getCyclePhase } from '@/utils/predictions';
import { formatDate, getDayOfCycle } from '@/utils/dates';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  // Mock data - replace with actual data from context/store
  const lastPeriodStart = new Date(2024, 9, 5); // Oct 5, 2024
  const averageCycleLength = 28;
  const prediction = calculateNextPeriod(lastPeriodStart, averageCycleLength, 'regular');
  const dayOfCycle = getDayOfCycle(lastPeriodStart);
  const phase = getCyclePhase(dayOfCycle);

  return (
    <View className="flex-1 bg-white">
      {/* Top App Bar */}
      <View className="flex-row items-center bg-white p-4 pb-2 justify-between" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex flex-col">
          <Text className="text-sm text-[#606e8a] font-medium">Buenos días</Text>
          <Text className="text-[#111318] text-2xl font-bold leading-tight tracking-tight">Hola, María</Text>
        </View>
        <View className="flex-row items-center justify-end gap-3">
          <Pressable className="flex items-center justify-center rounded-full h-10 w-10 bg-[#f5f6f8]">
            <Text className="text-[#111318] text-2xl">🔔</Text>
          </Pressable>
          <Pressable className="flex items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-[#f5f6f8]">
            <View className="h-full w-full bg-gray-300 rounded-full" />
          </Pressable>
        </View>
      </View>

      {/* Main Content Scroll Area */}
      <ScrollView className="flex-1 px-4 pt-2 pb-6" showsVerticalScrollIndicator={false}>
        {/* Hero Card: Next Period */}
        <View className="mt-4">
          <View className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white p-6 shadow-lg border border-gray-100 relative overflow-hidden">
            {/* Background decorative blobs */}
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-[#256af4]/5 rounded-full blur-2xl" />
            <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
            
            <View className="relative z-10 flex flex-col items-center text-center">
              <Text className="text-[#606e8a] text-sm font-medium uppercase tracking-wider mb-4">
                Próximo periodo
              </Text>
              
              {/* Circular Progress / Countdown Visualization */}
              <View className="relative flex items-center justify-center w-48 h-48 mb-4">
                {/* Simplified circular progress */}
                <View className="absolute inset-0 rounded-full border-8 border-gray-100" />
                <View 
                  className="absolute inset-0 rounded-full border-8 border-[#256af4]"
                  style={{ 
                    borderTopColor: 'transparent',
                    borderRightColor: 'transparent',
                    transform: [{ rotate: '-90deg' }],
                  }}
                />
                <View className="absolute inset-0 flex flex-col items-center justify-center">
                  <Text className="text-6xl font-bold text-[#111318] tracking-tighter">
                    {prediction.daysUntilPeriod}
                  </Text>
                  <Text className="text-sm font-medium text-[#606e8a] mt-1">días</Text>
                </View>
              </View>
              
              <View className="flex flex-col gap-1 items-center">
                <Text className="text-[#111318] text-lg font-bold">
                  {formatDate(prediction.nextPeriod, 'long')}
                </Text>
                <Text className="text-[#256af4] text-sm font-medium bg-[#256af4]/10 px-3 py-1 rounded-full">
                  Predicción regular
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Panel: Current Phase */}
        <View className="mt-6">
          <View className="flex flex-col gap-4 p-5 rounded-[2rem] bg-[#256af4]/5 border border-[#256af4]/10">
            <View className="flex items-start justify-between">
              <View className="flex flex-col gap-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-[#256af4] text-xl">💧</Text>
                  <Text className="text-[#256af4] text-sm font-bold uppercase tracking-wide">
                    Estado Actual
                  </Text>
                </View>
                <Text className="text-[#111318] text-2xl font-bold leading-tight">{phase}</Text>
                <Text className="text-[#606e8a] text-base font-normal leading-normal mt-1">
                  Día {dayOfCycle} del ciclo. Tu energía puede empezar a disminuir ligeramente.
                </Text>
              </View>
            </View>
            <Link href="/registro" asChild>
              <Pressable className="w-full flex-row items-center justify-center gap-2 rounded-full h-12 bg-[#256af4] shadow-lg">
                <Text className="text-xl">✏️</Text>
                <Text className="text-white text-base font-bold">Registrar síntomas</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Risk Card & Stats Row */}
        <View className="mt-6">
          {/* Pregnancy Risk Card */}
          <View className="flex-row items-center justify-between gap-4 p-5 rounded-[2rem] bg-white shadow-sm border border-gray-100">
            <View className="flex flex-col gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-400 text-xl">👶</Text>
                <Text className="text-[#111318] text-base font-bold">Riesgo de embarazo</Text>
              </View>
              <View className="inline-flex self-start flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-green-100">
                <View className="w-2 h-2 rounded-full bg-green-500" />
                <Text className="text-green-700 text-sm font-bold">Bajo</Text>
              </View>
            </View>
            {/* Abstract visual for risk */}
            <View className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <Text className="text-green-500 text-3xl">🛡️</Text>
            </View>
          </View>
        </View>

        {/* Section Header: Daily Insights */}
        <View className="mt-8 mb-4">
          <View className="flex-row items-center justify-between px-2">
            <Text className="text-[#111318] text-xl font-bold leading-tight">Resumen de hoy</Text>
            <Pressable>
              <Text className="text-[#256af4] text-sm font-semibold">Ver todo</Text>
            </Pressable>
          </View>
        </View>

        {/* Horizontal Scroll Cards (Insights) */}
        <View className="flex-row gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {/* Insight 1 */}
          <View className="flex-shrink-0 w-64 p-4 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm flex flex-col gap-3">
            <View className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Text className="text-2xl">☀️</Text>
            </View>
            <View>
              <Text className="font-bold text-[#111318]">Estado de ánimo</Text>
              <Text className="text-sm text-[#606e8a] mt-1">
                Es normal sentirse más introspectiva hoy.
              </Text>
            </View>
          </View>

          {/* Insight 2 */}
          <View className="flex-shrink-0 w-64 p-4 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm flex flex-col gap-3">
            <View className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Text className="text-2xl">🧘</Text>
            </View>
            <View>
              <Text className="font-bold text-[#111318]">Recomendación</Text>
              <Text className="text-sm text-[#606e8a] mt-1">
                Ideal para yoga suave o meditación.
              </Text>
            </View>
          </View>
        </View>

        {/* Safe Space / Privacy Note */}
        <View className="mt-4 mb-20 flex-row items-center justify-center gap-2 text-[#606e8a] opacity-60">
          <Text className="text-[16px]">🔒</Text>
          <Text className="text-xs font-medium">Tus datos están guardados localmente</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-6 py-2" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row items-center justify-between">
          {/* Home (Active) */}
          <Link href="/home" asChild>
            <Pressable className="flex flex-col items-center justify-center w-12 gap-1">
              <View className="relative flex items-center justify-center">
                <Text className="text-[#256af4] text-2xl">🏠</Text>
                <View className="absolute -bottom-2 w-1 h-1 bg-[#256af4] rounded-full" />
              </View>
              <Text className="text-[10px] font-bold text-[#256af4] mt-1">Inicio</Text>
            </Pressable>
          </Link>

          {/* Calendar */}
          <Link href="/calendar" asChild>
            <Pressable className="flex flex-col items-center justify-center w-12 gap-1">
              <Text className="text-[#9ca3af] text-2xl">📅</Text>
              <Text className="text-[10px] font-medium text-[#9ca3af] mt-1">Calendario</Text>
            </Pressable>
          </Link>

          {/* Reports/Insights */}
          <Link href="/predictions" asChild>
            <Pressable className="flex flex-col items-center justify-center w-12 gap-1">
              <Text className="text-[#9ca3af] text-2xl">📊</Text>
              <Text className="text-[10px] font-medium text-[#9ca3af] mt-1">Reportes</Text>
            </Pressable>
          </Link>

          {/* Settings */}
          <Link href="/settings" asChild>
            <Pressable className="flex flex-col items-center justify-center w-12 gap-1">
              <Text className="text-[#9ca3af] text-2xl">⚙️</Text>
              <Text className="text-[10px] font-medium text-[#9ca3af] mt-1">Ajustes</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

