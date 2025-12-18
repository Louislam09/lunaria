import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateNextPeriod } from '@/utils/predictions';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Mock data
  const lastPeriodStart = new Date(2024, 9, 4); // Oct 4
  const prediction = calculateNextPeriod(lastPeriodStart, 28, 'regular');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const isPeriodDay = (date: Date) => {
    const periodStart = new Date(2024, 9, 4);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 5);
    return date >= periodStart && date <= periodEnd;
  };

  const isFertileDay = (date: Date) => {
    const fertileStart = new Date(prediction.fertileWindow.start);
    const fertileEnd = new Date(prediction.fertileWindow.end);
    return date >= fertileStart && date <= fertileEnd;
  };

  const isOvulationDay = (date: Date) => {
    return date.toDateString() === prediction.ovulation.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const days = getDaysInMonth(currentMonth);
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <View className="flex-1 bg-[#f8f9fc] pb-24">
      {/* Top App Bar */}
      <View className="sticky top-0 z-50 bg-[#f8f9fc]/95 backdrop-blur-md border-b border-gray-100" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center p-4 justify-between">
          <Pressable>
            <Text className="text-[#111318] text-2xl">←</Text>
          </Pressable>
          <Text className="text-[#111318] text-lg font-bold leading-tight tracking-tight text-center">
            {monthName} {year}
          </Text>
          <Pressable>
            <Text className="text-[#256af4] text-sm font-bold leading-normal tracking-wide px-3 py-1.5 rounded-full">
              Hoy
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-2">
          {/* Weekday Headers */}
          <View className="flex-row mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <View key={index} className="flex-1 items-center justify-center h-8">
                <Text className="text-slate-400 text-[13px] font-bold">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View className="flex-row flex-wrap">
            {days.map((date, index) => {
              if (!date) {
                return <View key={index} className="h-11 flex-1" />;
              }

              const isPeriod = isPeriodDay(date);
              const isFertile = isFertileDay(date);
              const isOvul = isOvulationDay(date);
              const isCurrentDay = isToday(date);

              return (
                <Pressable key={index} className="h-11 flex-1 items-center justify-center">
                  {isPeriod ? (
                    <View className="relative w-full h-full items-center justify-center">
                      <View className="absolute inset-y-[4px] inset-x-0 bg-[#fb7185]/20 z-0" />
                      <View className={`relative z-10 size-9 items-center justify-center rounded-full ${
                        index % 7 === 0 || (index + 1) % 7 === 0
                          ? 'bg-[#fb7185]'
                          : 'bg-transparent'
                      }`}>
                        <Text className={`text-sm font-bold ${
                          index % 7 === 0 || (index + 1) % 7 === 0
                            ? 'text-white'
                            : 'text-[#fb7185]'
                        }`}>
                          {date.getDate()}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View className="relative w-full h-full items-center justify-center">
                      {isFertile && !isOvul && (
                        <View className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#f472b6]" />
                      )}
                      {isOvul && (
                        <View className="size-9 items-center justify-center rounded-full border-2 border-[#c084fc] bg-purple-50">
                          <Text className="text-sm font-bold text-[#c084fc]">
                            {date.getDate()}
                          </Text>
                        </View>
                      )}
                      {!isOvul && (
                        <View className={`size-9 items-center justify-center rounded-full ${
                          isCurrentDay
                            ? 'bg-[#256af4]'
                            : 'bg-transparent'
                        }`}>
                          <Text className={`text-sm font-medium ${
                            isCurrentDay
                              ? 'text-white font-bold'
                              : 'text-[#111318]'
                          }`}>
                            {date.getDate()}
                          </Text>
                        </View>
                      )}
                      {isCurrentDay && (
                        <View className="absolute -bottom-1.5">
                          <Text className="text-[10px] font-bold text-[#256af4]">Hoy</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View className="px-4 py-2">
          <View className="flex-row items-center justify-around rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
            <View className="flex flex-col items-center gap-1.5">
              <View className="size-3 rounded-full bg-[#fb7185]" />
              <Text className="text-xs font-medium text-slate-500">Periodo</Text>
            </View>
            <View className="flex flex-col items-center gap-1.5">
              <View className="size-3 rounded-full bg-[#f472b6]" />
              <Text className="text-xs font-medium text-slate-500">Fértil</Text>
            </View>
            <View className="flex flex-col items-center gap-1.5">
              <View className="size-3 rounded-full border-2 border-[#c084fc]" />
              <Text className="text-xs font-medium text-slate-500">Ovulación</Text>
            </View>
          </View>
        </View>

        {/* Status Card */}
        <View className="p-4 pt-2">
          <View className="flex-row items-stretch justify-between gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <View className="flex flex-col gap-2 flex-[2]">
              <View>
                <View className="inline-block px-2.5 py-0.5 rounded-full bg-green-50 mb-1">
                  <Text className="text-green-700 text-[11px] font-bold uppercase tracking-wider">
                    Fase Lútea
                  </Text>
                </View>
                <Text className="text-[#111318] text-lg font-bold leading-tight">
                  Día 17 del ciclo
                </Text>
              </View>
              <Text className="text-slate-500 text-sm font-normal leading-normal">
                Probabilidad baja de embarazo. Tu próximo periodo se espera en 11 días.
              </Text>
            </View>
            <View className="w-24 bg-pink-50 rounded-xl shrink-0 flex items-center justify-center">
              <Text className="text-4xl">🌸</Text>
            </View>
          </View>
        </View>

        {/* FAB Section */}
        <View className="flex justify-center px-5 pb-5">
          <Link href="/registro" asChild>
            <Pressable className="group relative flex w-full max-w-sm items-center justify-center overflow-hidden rounded-xl h-14 bg-[#256af4] shadow-lg">
              <Text className="text-white text-xl mr-2">💧</Text>
              <Text className="text-base font-bold leading-normal tracking-wide text-white">
                Registrar Periodo
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 h-[80px] z-50" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-between items-center max-w-lg mx-auto h-full pb-4">
          <Pressable className="flex flex-col items-center justify-center w-16 gap-1">
            <View className="flex items-center justify-center p-1 rounded-full bg-[#256af4]/10">
              <Text className="text-[#256af4] text-xl">📅</Text>
            </View>
            <Text className="text-[11px] font-bold text-[#256af4]">Calendario</Text>
          </Pressable>

          <Link href="/predictions" asChild>
            <Pressable className="flex flex-col items-center justify-center w-16 gap-1">
              <Text className="text-slate-400 text-xl">📊</Text>
              <Text className="text-[11px] font-medium text-slate-400">Reportes</Text>
            </Pressable>
          </Link>

          <Link href="/settings" asChild>
            <Pressable className="flex flex-col items-center justify-center w-16 gap-1">
              <Text className="text-slate-400 text-xl">⚙️</Text>
              <Text className="text-[11px] font-medium text-slate-400">Ajustes</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

