import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';
import { getNextPeriodDate, getCycleDay, getCyclePhase, getFertileWindow } from '@/utils/predictions';
import { formatDate } from '@/utils/dates';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isComplete } = useOnboarding();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Redirect to onboarding if not complete
  React.useEffect(() => {
    if (!isLoading && !isComplete) {
      router.replace('/onboarding/info');
    }
  }, [isLoading, isComplete]);

  if (isLoading || !isComplete || !data.lastPeriodStart || !data.cycleType || !data.periodLength) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // Prepare prediction input
  const predictionInput = {
    lastPeriodStart: data.lastPeriodStart,
    cycleType: data.cycleType,
    averageCycleLength: data.averageCycleLength,
    cycleRangeMin: data.cycleRangeMin,
    cycleRangeMax: data.cycleRangeMax,
    periodLength: data.periodLength,
  };

  const nextPeriodResult = getNextPeriodDate(predictionInput);
  const cycleDay = getCycleDay(data.lastPeriodStart);
  const cycleLength = data.cycleType === 'regular' && data.averageCycleLength
    ? data.averageCycleLength
    : data.cycleRangeMin && data.cycleRangeMax
      ? Math.round((data.cycleRangeMin + data.cycleRangeMax) / 2)
      : 28;
  const phase = getCyclePhase(cycleDay, cycleLength);
  const fertileWindow = data.cycleType === 'regular' && data.averageCycleLength
    ? getFertileWindow(data.averageCycleLength)
    : null;

  // Calculate ovulation date (for regular cycles)
  const ovulationDate = data.cycleType === 'regular' && data.averageCycleLength
    ? (() => {
      const ov = new Date(nextPeriodResult.date);
      ov.setDate(ov.getDate() - 14);
      return ov;
    })()
    : null;

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
    // Check if date is within current period
    const periodStart = new Date(data.lastPeriodStart);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + (data.periodLength || 5));

    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);

    if (dateNormalized >= periodStart && dateNormalized <= periodEnd) {
      return true;
    }

    // Check if date is within next period
    const nextPeriodStart = new Date(nextPeriodResult.date);
    nextPeriodStart.setHours(0, 0, 0, 0);
    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + (data.periodLength || 5));

    if (dateNormalized >= nextPeriodStart && dateNormalized <= nextPeriodEnd) {
      return true;
    }

    return false;
  };

  const isFertileDay = (date: Date) => {
    if (!fertileWindow || data.cycleType !== 'regular') return false;

    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);

    // Calculate fertile window dates based on cycle day
    const lastPeriod = new Date(data.lastPeriodStart);
    lastPeriod.setHours(0, 0, 0, 0);

    const fertileStart = new Date(lastPeriod);
    fertileStart.setDate(fertileStart.getDate() + fertileWindow.startDay);

    const fertileEnd = new Date(lastPeriod);
    fertileEnd.setDate(fertileEnd.getDate() + fertileWindow.endDay);

    return dateNormalized >= fertileStart && dateNormalized <= fertileEnd;
  };

  const isOvulationDay = (date: Date) => {
    if (!ovulationDate) return false;
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);
    const ovNormalized = new Date(ovulationDate);
    ovNormalized.setHours(0, 0, 0, 0);
    return dateNormalized.getTime() === ovNormalized.getTime();
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

  // Get phase name in Spanish
  const getPhaseName = (phase: string) => {
    const phases: Record<string, string> = {
      menstrual: 'Menstruación',
      follicular: 'Fase Folicular',
      ovulatory: 'Ovulación',
      luteal: 'Fase Lútea',
    };
    return phases[phase] || phase;
  };

  // Calculate days until next period
  const daysUntilNext = Math.ceil(
    (nextPeriodResult.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar */}
      <View className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-gray-100" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center p-4 justify-between">
          <Pressable onPress={() => {
            const prevMonth = new Date(currentMonth);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            setCurrentMonth(prevMonth);
          }}>
            <Text className="text-text-primary text-2xl">←</Text>
          </Pressable>
          <Text className="text-text-primary text-lg font-bold leading-tight tracking-tight text-center">
            {monthName} {year}
          </Text>
          <Pressable onPress={() => setCurrentMonth(new Date())}>
            <Text className="text-primary text-sm font-bold leading-normal tracking-wide px-3 py-1.5 rounded-full">
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
                      <View className="absolute inset-y-[4px] inset-x-0 bg-secondary/20 z-0" />
                      <View className={`relative z-10 size-9 items-center justify-center rounded-full ${index % 7 === 0 || (index + 1) % 7 === 0
                        ? 'bg-secondary'
                        : 'bg-transparent'
                        }`}>
                        <Text className={`text-sm font-bold ${index % 7 === 0 || (index + 1) % 7 === 0
                          ? 'text-white'
                          : 'text-secondary'
                          }`}>
                          {date.getDate()}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View className="relative w-full h-full items-center justify-center">
                      {isFertile && !isOvul && (
                        <View className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-secondary" />
                      )}
                      {isOvul && (
                        <View className="size-9 items-center justify-center rounded-full border-2 border-[#c084fc] bg-purple-50">
                          <Text className="text-sm font-bold text-primary">
                            {date.getDate()}
                          </Text>
                        </View>
                      )}
                      {!isOvul && (
                        <View className={`size-9 items-center justify-center rounded-full ${isCurrentDay
                          ? 'bg-primary'
                          : 'bg-transparent'
                          }`}>
                          <Text className={`text-sm font-medium ${isCurrentDay
                            ? 'text-white font-bold'
                            : 'text-text-primary'
                            }`}>
                            {date.getDate()}
                          </Text>
                        </View>
                      )}
                      {isCurrentDay && (
                        <View className="absolute -bottom-1.5">
                          <Text className="text-[10px] font-bold text-primary">Hoy</Text>
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
              <View className="size-3 rounded-full bg-secondary" />
              <Text className="text-xs font-medium text-slate-500">Periodo</Text>
            </View>
            {data.cycleType === 'regular' && (
              <>
                <View className="flex flex-col items-center gap-1.5">
                  <View className="size-3 rounded-full bg-secondary" />
                  <Text className="text-xs font-medium text-slate-500">Fértil</Text>
                </View>
                <View className="flex flex-col items-center gap-1.5">
                  <View className="size-3 rounded-full border-2 border-[#c084fc]" />
                  <Text className="text-xs font-medium text-slate-500">Ovulación</Text>
                </View>
              </>
            )}
            {data.cycleType === 'irregular' && (
              <View className="flex flex-col items-center gap-1.5">
                <Text className="text-xs font-medium text-slate-500 text-center px-2">
                  Predicciones aproximadas
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Card */}
        <View className="p-4 pt-2">
          <View className="flex-row items-stretch justify-between gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <View className="flex flex-col gap-2 flex-2">
              <View>
                <View className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 mb-1">
                  <Text className="text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                    {getPhaseName(phase)}
                  </Text>
                </View>
                <Text className="text-text-primary text-lg font-bold leading-tight">
                  Día {cycleDay} del ciclo
                </Text>
              </View>
              <Text className="text-slate-500 text-sm font-normal leading-normal">
                {daysUntilNext > 0
                  ? `Tu próximo periodo se espera en ${daysUntilNext} días.`
                  : 'Tu periodo debería estar comenzando.'}
                {data.cycleType === 'irregular' && ' Las predicciones son aproximadas.'}
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
            <Pressable className="group relative flex w-full max-w-sm items-center justify-center overflow-hidden rounded-xl h-14 bg-primary shadow-lg">
              <Text className="text-white text-xl mr-2">💧</Text>
              <Text className="text-base font-bold leading-normal tracking-wide text-white">
                Registrar Periodo
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

