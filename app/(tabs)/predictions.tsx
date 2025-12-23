import MyIcon from '@/components/ui/Icon';
import { useOnboarding } from '@/context/OnboardingContext';
import { formatDate, getDaysUntil } from '@/utils/dates';
import { getCycleDay, getCyclePhase, getFertileWindow, getNextPeriodDate } from '@/utils/predictions';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  // return <PredictionsS />

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
        <Text className="text-2xl font-bold text-text-primary">
          Predicciones
        </Text>

        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-background">
          {/* <Bell size={24} color={colors.textPrimary} /> */}
          <MyIcon name="Bell" className="text-text-primary" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View className="h-24" />
        <View className="rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-200">
          <ImageBackground
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuADYt505TH4cOvY-57cAwJi2Vv46C1raokpDxZt5LAS5I4EYOjjIpVN0YP-D6XznmqCAksIi1YOrp7WqMamK-G3UvxnTw8T72pOL19-zLZEafz9sj8GKsC9vsiIqdjMUb8iqvzkk6G99zpaLKzS1ryMPObUxbAhBhYOjGuFm8H7e8NM3H_iAELoSQMJEyfi3Mo_8d2c4j7b5gXTsqS4UevZfb3Miq1EpQnT7OwoSNdZoCw9XkLnhkajqgMhNSRUKtzU1CW9rmnh6ns",
            }}
            className="h-48 justify-end"
          >
            <View className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
            {/* <View className="absolute inset-0 bg-linear-to-bl from-black/10 to-white/20" /> */}
            <View className="p-4">
              <Text className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-1">
                Tu próximo periodo
              </Text>
              <View className="flex-row items-end justify-between">
                {nextPeriodResult.range ? (
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-text-primary">
                      {formatDate(nextPeriodResult.range.start, 'short')} - {formatDate(nextPeriodResult.range.end, 'short')}
                    </Text>
                    <Text className="text-orange-600 text-xs font-medium mt-1">
                      Rango aproximado
                    </Text>
                  </View>
                ) : (
                  <Text className="text-4xl font-bold text-text-primary">{formatDate(nextPeriodResult.date, 'short')}</Text>
                )}
                <View className={`px-3 py-1 rounded-full ${nextPeriodResult.precision === 'high' ? 'bg-primary' : 'bg-orange-500'}`}>
                  <Text className="text-white text-sm font-medium">
                    {daysUntilPeriod > 0 ? `${daysUntilPeriod} días` : daysUntilPeriod === 0 ? 'Hoy' : 'Pasado'}
                  </Text>
                </View>
              </View>
            </View>
          </ImageBackground>

          {/* Week Strip */}
          <View className="flex-row justify-between px-4 py-4 border-t border-gray-100 ">
            {weekDays.map((date, index) => {
              const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
              const dayName = dayNames[date.getDay()];
              const isPeriod = isPeriodDay(date);
              const isCurrentDay = isToday(date);

              return (
                <View key={index} className="items-center gap-1">
                  <Text
                    className={`text-xs ${isCurrentDay
                      ? "text-primary font-bold"
                      : "text-text-secondary"
                      }`}
                  >
                    {dayName}
                  </Text>

                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${isCurrentDay
                      ? "bg-primary"
                      : isPeriod
                        ? "bg-[#e96e7e]"
                        : ""
                      }`}
                  >
                    <Text
                      className={`text-sm font-bold ${isCurrentDay || isPeriod
                        ? "text-white"
                        : "text-text-primary"
                        }`}
                    >
                      {date.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Details */}
        <View className="my-6">
          <Text className="text-xl font-bold mb-3 text-text-primary">
            Detalles del ciclo
          </Text>

          <View className="flex-row gap-3">
            {/* Ovulation */}
            {ovulationDate ? (
              <View className="flex-1 bg-white rounded-3xl p-5 shadow-md gap-3 border border-gray-200">
                <View className="flex-row justify-between items-center">
                  <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                    <MyIcon name="Droplet" className="text-purple-500" />
                  </View>
                  <Text className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    Alta
                  </Text>
                </View>
                <Text className="text-sm text-text-secondary">
                  Ovulación
                </Text>
                <Text className="text-xl font-bold text-text-primary">
                  {formatDate(ovulationDate, 'short')}
                </Text>
              </View>
            ) : (
              <View className="flex-1 bg-white rounded-3xl p-5 shadow-md gap-3 border border-gray-200">
                <View className="flex-row justify-between items-center">
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                    <MyIcon name="Info" className="text-gray-500" />
                  </View>
                </View>
                <Text className="text-sm text-text-secondary">
                  Ovulación
                </Text>
                <Text className="text-sm font-medium text-text-primary">
                  No determinada
                </Text>
              </View>
            )}

            {/* Fertile */}
            {fertileWindowDates ? (
              <View className="flex-1 bg-white rounded-3xl p-5 shadow-md gap-3 border border-gray-200">
                <View className="w-10 h-10 rounded-full bg-teal-100 items-center justify-center">
                  <MyIcon name="Flower" className="text-teal-500" />
                </View>
                <Text className="text-sm text-text-secondary">
                  Ventana fértil
                </Text>
                <Text className="text-xl font-bold text-text-primary">
                  {formatDate(fertileWindowDates.start, 'short')} - {formatDate(fertileWindowDates.end, 'short')}
                </Text>
              </View>
            ) : (
              <View className="flex-1 bg-white rounded-3xl p-5 shadow-md gap-3 border border-gray-200">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <MyIcon name="Info" className="text-gray-500" />
                </View>
                <Text className="text-sm text-text-secondary">
                  Ventana fértil
                </Text>
                <Text className="text-sm font-medium text-text-primary">
                  No determinada
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Contraceptive */}
        {/* {data.contraceptiveMethod && data.contraceptiveMethod !== 'none' && ( */}
        {(
          <View className="bg-blue-50 rounded-3xl p-5 gap-4 border border-gray-200 shadow-md">
            <View className="flex-row gap-3">
              <MyIcon name="ShieldCheck" className="text-blue-500" />
              <View className="flex-1 gap-1">
                <Text className="font-bold text-text-primary">
                  Método anticonceptivo
                </Text>
                <Text className="text-sm text-text-secondary">
                  Tu método actual ({getContraceptiveLabel()}) puede afectar tu ciclo y las predicciones.
                </Text>
              </View>
            </View>

            {/* <TouchableOpacity activeOpacity={0.6} className="w-full  bg-primary py-5 rounded-full items-center justify-center flex-row gap-2">
              <MyIcon name="ArrowRight" size={20} className="text-white " />
              <Text className="text-white font-bold text-base">
                Ver detalles
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity className="self-start bg-primary px-5 py-2 rounded-full" activeOpacity={0.6}>
              <Text className="text-white font-bold text-sm">
                Ver detalles
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

