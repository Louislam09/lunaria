import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateNextPeriod } from '@/utils/predictions';
import { formatDate } from '@/utils/dates';

export default function PredictionsScreen() {
  const insets = useSafeAreaInsets();
  
  // Mock data
  const lastPeriodStart = new Date(2024, 9, 5);
  const prediction = calculateNextPeriod(lastPeriodStart, 28, 'regular');
  const ovulation = prediction.ovulation;
  const fertileWindow = prediction.fertileWindow;

  // Week calendar data
  const today = new Date();
  const weekDays = [];
  for (let i = -2; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    weekDays.push(date);
  }

  const isPeriodDay = (date: Date) => {
    return date.getTime() >= prediction.nextPeriod.getTime() && 
           date.getTime() < prediction.nextPeriod.getTime() + (5 * 24 * 60 * 60 * 1000);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <View className="flex-1 bg-[#f5f6f8]">
      {/* Header */}
      <View className="flex-row items-center bg-[#f5f6f8] p-4 pb-2 justify-between sticky top-0 z-20" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-[#111318] text-2xl font-bold leading-tight tracking-tight flex-1">
          Predicciones
        </Text>
        <View className="flex-row gap-2">
          <Pressable className="p-2 rounded-full">
            <Text className="text-[#111318] text-xl">🔔</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="px-4 flex flex-col gap-6 pt-2" showsVerticalScrollIndicator={false}>
        {/* Hero Prediction Card */}
        <View>
          <View className="flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-white overflow-hidden">
            {/* Gradient background */}
            <View className="relative w-full h-48 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">
              <View className="absolute bottom-4 left-4 right-4">
                <Text className="text-[#606e8a] text-sm font-medium uppercase tracking-wider mb-1">
                  Tu próximo periodo
                </Text>
                <View className="flex-row items-end justify-between">
                  <Text className="text-[#111318] text-4xl font-bold tracking-tight">
                    {formatDate(prediction.nextPeriod, 'short')}
                  </Text>
                  <View className="bg-[#256af4] px-3 py-1 rounded-full mb-1">
                    <Text className="text-white text-sm font-medium">
                      En {prediction.daysUntilPeriod} días
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Week Calendar Strip inside Card */}
            <View className="p-4 pt-0">
              <View className="flex-row justify-between items-center gap-2 pt-4 border-t border-gray-100">
                {weekDays.map((date, index) => {
                  const dayName = ['L', 'M', 'X', 'J', 'V', 'S', 'D'][date.getDay()];
                  const isPeriod = isPeriodDay(date);
                  const isCurrentDay = isToday(date);
                  
                  return (
                    <View key={index} className="flex flex-col items-center gap-1">
                      <Text className={`text-xs font-medium ${
                        isCurrentDay ? 'text-[#256af4] font-bold' : 'text-[#606e8a]'
                      }`}>
                        {dayName}
                      </Text>
                      <View className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                        isCurrentDay
                          ? 'bg-[#256af4] text-white shadow-lg'
                          : isPeriod
                          ? 'bg-[#e96e7e] text-white'
                          : 'bg-transparent text-[#111318]'
                      }`}>
                        <Text className={`text-sm font-bold ${
                          isCurrentDay || isPeriod ? 'text-white' : 'text-[#111318]'
                        }`}>
                          {date.getDate()}
                        </Text>
                      </View>
                      {isPeriod && <View className="absolute -bottom-1 w-1 h-1 bg-[#e96e7e] rounded-full" />}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View>
          <Text className="text-[#111318] text-lg font-bold leading-tight mb-3">
            Detalles del ciclo
          </Text>
          <View className="flex-row gap-3">
            {/* Ovulation Card */}
            <View className="flex-1 gap-4 rounded-xl border border-transparent bg-white p-5 flex-col shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Text className="text-xl">🥚</Text>
                </View>
                <View className="bg-purple-50 px-2 py-0.5 rounded-full">
                  <Text className="text-xs font-semibold text-purple-600">Alta</Text>
                </View>
              </View>
              <View className="flex flex-col gap-1">
                <Text className="text-[#606e8a] text-sm font-normal leading-normal">
                  Ovulación
                </Text>
                <Text className="text-[#111318] text-xl font-bold leading-tight">
                  {formatDate(ovulation, 'short')}
                </Text>
              </View>
            </View>

            {/* Fertile Window Card */}
            <View className="flex-1 gap-4 rounded-xl border border-transparent bg-white p-5 flex-col shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Text className="text-xl">🌿</Text>
                </View>
              </View>
              <View className="flex flex-col gap-1">
                <Text className="text-[#606e8a] text-sm font-normal leading-normal">
                  Ventana fértil
                </Text>
                <Text className="text-[#111318] text-xl font-bold leading-tight">
                  {formatDate(fertileWindow.start, 'short')} - {formatDate(fertileWindow.end, 'short')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contraceptive Warning */}
        <View>
          <View className="flex-1 flex-col items-start justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
            <View className="flex-row gap-4">
              <View className="flex-shrink-0 mt-1 text-[#256af4]">
                <Text className="text-2xl">🛡️</Text>
              </View>
              <View className="flex flex-col gap-1">
                <Text className="text-[#111318] text-base font-bold leading-tight">
                  Método anticonceptivo
                </Text>
                <Text className="text-[#606e8a] text-sm font-normal leading-normal">
                  Tu método actual (Píldora) reduce significativamente el riesgo de embarazo.
                </Text>
              </View>
            </View>
            <Pressable className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-full h-9 px-5 bg-[#256af4]">
              <Text className="truncate text-white text-sm font-medium">Ver detalles</Text>
            </Pressable>
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe pt-2 z-50" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-around items-center px-2 pb-4 pt-1">
          <Link href="/home" asChild>
            <Pressable className="flex flex-col items-center justify-center gap-1 p-2 w-16">
              <Text className="text-[#606e8a] text-xl">📅</Text>
              <Text className="text-[10px] font-medium text-[#606e8a]">Hoy</Text>
            </Pressable>
          </Link>

          <Link href="/calendar" asChild>
            <Pressable className="flex flex-col items-center justify-center gap-1 p-2 w-16">
              <Text className="text-[#606e8a] text-xl">📆</Text>
              <Text className="text-[10px] font-medium text-[#606e8a]">Calendario</Text>
            </Pressable>
          </Link>

          <Pressable className="flex flex-col items-center justify-center gap-1 p-2 w-16 text-[#256af4]">
            <Text className="text-[#256af4] text-xl">📈</Text>
            <Text className="text-[10px] font-bold text-[#256af4]">Predicciones</Text>
          </Pressable>

          <Link href="/settings" asChild>
            <Pressable className="flex flex-col items-center justify-center gap-1 p-2 w-16">
              <Text className="text-[#606e8a] text-xl">👤</Text>
              <Text className="text-[10px] font-medium text-[#606e8a]">Perfil</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

