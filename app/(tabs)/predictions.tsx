import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';
import { getNextPeriodDate, getCycleDay, getCyclePhase, getFertileWindow } from '@/utils/predictions';
import { formatDate, getDaysUntil } from '@/utils/dates';

export default function PredictionsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isComplete } = useOnboarding();

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

  // Calculate fertile window dates
  const fertileWindowDates = fertileWindow && data.cycleType === 'regular' && data.averageCycleLength
    ? (() => {
        const lastPeriod = new Date(data.lastPeriodStart);
        const start = new Date(lastPeriod);
        start.setDate(start.getDate() + fertileWindow.startDay);
        const end = new Date(lastPeriod);
        end.setDate(end.getDate() + fertileWindow.endDay);
        return { start, end };
      })()
    : null;

  const daysUntilPeriod = getDaysUntil(nextPeriodResult.date);

  // Week calendar data
  const today = new Date();
  const weekDays = [];
  for (let i = -2; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    weekDays.push(date);
  }

  const isPeriodDay = (date: Date) => {
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);
    
    // Check current period
    const periodStart = new Date(data.lastPeriodStart);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + (data.periodLength || 5));
    
    if (dateNormalized >= periodStart && dateNormalized <= periodEnd) {
      return true;
    }

    // Check next period
    const nextPeriodStart = new Date(nextPeriodResult.date);
    nextPeriodStart.setHours(0, 0, 0, 0);
    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + (data.periodLength || 5));
    
    if (nextPeriodResult.range) {
      // For irregular cycles, check if date is within range
      const rangeStart = new Date(nextPeriodResult.range.start);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(nextPeriodResult.range.end);
      rangeEnd.setHours(0, 0, 0, 0);
      rangeEnd.setDate(rangeEnd.getDate() + (data.periodLength || 5));
      
      return dateNormalized >= rangeStart && dateNormalized <= rangeEnd;
    }
    
    return dateNormalized >= nextPeriodStart && dateNormalized <= nextPeriodEnd;
  };

  const isToday = (date: Date) => {
    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);
    return dateNormalized.getTime() === todayNormalized.getTime();
  };

  // Get contraceptive method label
  const getContraceptiveLabel = () => {
    const methods: Record<string, string> = {
      none: 'Ninguno',
      condom: 'Condón',
      pill: 'Pastillas',
      injection: 'Inyección',
      implant: 'Implante',
      iud_hormonal: 'DIU hormonal',
      iud_copper: 'DIU de cobre',
      other: 'Otro',
    };
    return methods[data.contraceptiveMethod || 'none'] || 'No especificado';
  };

  return (
    <View className="flex-1 bg-moon-white">
      {/* Header */}
      <View className="flex-row items-center bg-moon-white p-4 pb-2 justify-between sticky top-0 z-20" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-text-primary text-2xl font-bold leading-tight tracking-tight flex-1">
          Predicciones
        </Text>
        <View className="flex-row gap-2">
          <Pressable className="p-2 rounded-full">
            <Text className="text-text-primary text-xl">🔔</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="px-4 flex flex-col gap-6 pt-2" showsVerticalScrollIndicator={false}>
        {/* Precision Disclaimer for Irregular Cycles */}
        {data.cycleType === 'irregular' && (
          <View className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
            <View className="flex-row items-start gap-3">
              <Text className="text-2xl">⚠️</Text>
              <View className="flex-1">
                <Text className="text-orange-800 text-sm font-bold mb-1">
                  Predicciones aproximadas
                </Text>
                <Text className="text-orange-700 text-xs font-normal leading-relaxed">
                  Tu ciclo es irregular. Las predicciones son estimaciones basadas en rangos y pueden variar.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Hero Prediction Card */}
        <View>
          <View className="flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-white overflow-hidden">
            {/* Gradient background */}
            <View className="relative w-full h-48 bg-linear-to-br from-pink-200 via-purple-200 to-blue-200">
              <View className="absolute bottom-4 left-4 right-4">
                <Text className="text-text-muted text-sm font-medium uppercase tracking-wider mb-1">
                  Tu próximo periodo
                </Text>
                <View className="flex-row items-end justify-between">
                  {nextPeriodResult.range ? (
                    <View className="flex-1">
                      <Text className="text-text-primary text-2xl font-bold tracking-tight">
                        {formatDate(nextPeriodResult.range.start, 'short')} - {formatDate(nextPeriodResult.range.end, 'short')}
                      </Text>
                      <Text className="text-orange-600 text-xs font-medium mt-1">
                        Rango aproximado
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-text-primary text-4xl font-bold tracking-tight">
                      {formatDate(nextPeriodResult.date, 'short')}
                    </Text>
                  )}
                  <View className={`px-3 py-1 rounded-full mb-1 ${
                    nextPeriodResult.precision === 'high' 
                      ? 'bg-lavender' 
                      : 'bg-orange-500'
                  }`}>
                    <Text className="text-white text-sm font-medium">
                      En {daysUntilPeriod} días
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Week Calendar Strip inside Card */}
            <View className="p-4 pt-0">
              <View className="flex-row justify-between items-center gap-2 pt-4 border-t border-gray-100">
                {weekDays.map((date, index) => {
                  const dayName = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()];
                  const isPeriod = isPeriodDay(date);
                  const isCurrentDay = isToday(date);
                  
                  return (
                    <View key={index} className="flex flex-col items-center gap-1">
                      <Text className={`text-xs font-medium ${
                        isCurrentDay ? 'text-lavender font-bold' : 'text-text-muted'
                      }`}>
                        {dayName}
                      </Text>
                      <View className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                        isCurrentDay
                          ? 'bg-lavender text-white shadow-lg'
                          : isPeriod
                          ? 'bg-blush text-white'
                          : 'bg-transparent text-text-primary'
                      }`}>
                        <Text className={`text-sm font-bold ${
                          isCurrentDay || isPeriod ? 'text-white' : 'text-text-primary'
                        }`}>
                          {date.getDate()}
                        </Text>
                      </View>
                      {isPeriod && <View className="absolute -bottom-1 w-1 h-1 bg-blush rounded-full" />}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View>
          <Text className="text-text-primary text-lg font-bold leading-tight mb-3">
            Detalles del ciclo
          </Text>
          <View className="flex-row gap-3">
            {/* Ovulation Card - Only for regular cycles */}
            {ovulationDate ? (
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
                  <Text className="text-text-muted text-sm font-normal leading-normal">
                    Ovulación
                  </Text>
                  <Text className="text-text-primary text-xl font-bold leading-tight">
                    {formatDate(ovulationDate, 'short')}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-1 gap-4 rounded-xl border border-transparent bg-white p-5 flex-col shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Text className="text-xl">❓</Text>
                  </View>
                </View>
                <View className="flex flex-col gap-1">
                  <Text className="text-text-muted text-sm font-normal leading-normal">
                    Ovulación
                  </Text>
                  <Text className="text-text-primary text-sm font-medium leading-tight">
                    No determinada
                  </Text>
                </View>
              </View>
            )}

            {/* Fertile Window Card - Only for regular cycles */}
            {fertileWindowDates ? (
              <View className="flex-1 gap-4 rounded-xl border border-transparent bg-white p-5 flex-col shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Text className="text-xl">🌿</Text>
                  </View>
                </View>
                <View className="flex flex-col gap-1">
                  <Text className="text-text-muted text-sm font-normal leading-normal">
                    Ventana fértil
                  </Text>
                  <Text className="text-text-primary text-xl font-bold leading-tight">
                    {formatDate(fertileWindowDates.start, 'short')} - {formatDate(fertileWindowDates.end, 'short')}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-1 gap-4 rounded-xl border border-transparent bg-white p-5 flex-col shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Text className="text-xl">❓</Text>
                  </View>
                </View>
                <View className="flex flex-col gap-1">
                  <Text className="text-text-muted text-sm font-normal leading-normal">
                    Ventana fértil
                  </Text>
                  <Text className="text-text-primary text-sm font-medium leading-tight">
                    No determinada
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Cycle Info Card */}
        <View>
          <View className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <Text className="text-[#111318] text-base font-bold mb-3">Información del ciclo</Text>
            <View className="flex flex-col gap-2">
              <View className="flex-row justify-between">
                <Text className="text-[#606e8a] text-sm">Día actual del ciclo</Text>
                <Text className="text-[#111318] text-sm font-bold">{cycleDay}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[#606e8a] text-sm">Fase actual</Text>
                <Text className="text-[#111318] text-sm font-bold">
                  {phase === 'menstrual' ? 'Menstruación' :
                   phase === 'follicular' ? 'Fase Folicular' :
                   phase === 'ovulatory' ? 'Ovulación' :
                   'Fase Lútea'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[#606e8a] text-sm">Tipo de ciclo</Text>
                <Text className="text-[#111318] text-sm font-bold">
                  {data.cycleType === 'regular' ? 'Regular' : 'Irregular'}
                </Text>
              </View>
              {data.cycleType === 'regular' && data.averageCycleLength && (
                <View className="flex-row justify-between">
                  <Text className="text-[#606e8a] text-sm">Duración promedio</Text>
                  <Text className="text-[#111318] text-sm font-bold">{data.averageCycleLength} días</Text>
                </View>
              )}
              {data.cycleType === 'irregular' && data.cycleRangeMin && data.cycleRangeMax && (
                <View className="flex-row justify-between">
                  <Text className="text-[#606e8a] text-sm">Rango de duración</Text>
                  <Text className="text-[#111318] text-sm font-bold">
                    {data.cycleRangeMin} - {data.cycleRangeMax} días
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Contraceptive Warning - Only if method is set */}
        {data.contraceptiveMethod && data.contraceptiveMethod !== 'none' && (
          <View>
            <View className="flex-1 flex-col items-start justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
              <View className="flex-row gap-4">
                <View className="shrink-0 mt-1 text-[#256af4]">
                  <Text className="text-2xl">🛡️</Text>
                </View>
                <View className="flex flex-col gap-1">
                  <Text className="text-[#111318] text-base font-bold leading-tight">
                    Método anticonceptivo
                  </Text>
                  <Text className="text-text-muted text-sm font-normal leading-normal">
                    Tu método actual ({getContraceptiveLabel()}) puede afectar tu ciclo y las predicciones.
                  </Text>
                </View>
              </View>
              <Pressable className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-full h-9 px-5 bg-[#256af4]">
                <Text className="truncate text-white text-sm font-medium">Ver detalles</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

