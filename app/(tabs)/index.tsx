import { MyImage } from '@/components/ui';
import { CircularProgress } from '@/components/ui/CircularProgress';
import MyIcon from '@/components/ui/Icon';
import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import { getDaysUntil } from '@/utils/dates';
import { getCycleDay, getCyclePhase, getFertileWindow, getNextPeriodDate } from '@/utils/predictions';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 264

export default function HomeScreen() {
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

  // Get predictions
  const nextPeriodResult = getNextPeriodDate(predictionInput);
  const cycleDay = getCycleDay(data.lastPeriodStart);
  const cycleLength = data.cycleType === 'regular' && data.averageCycleLength
    ? data.averageCycleLength
    : data.cycleRangeMin && data.cycleRangeMax
      ? Math.round((data.cycleRangeMin + data.cycleRangeMax) / 2)
      : 28; // fallback
  const phase = getCyclePhase(cycleDay, cycleLength);
  const fertileWindow = data.cycleType === 'regular' && data.averageCycleLength
    ? getFertileWindow(data.averageCycleLength)
    : null;

  // Calculate days until next period
  const daysUntilPeriod = getDaysUntil(nextPeriodResult.date);

  // Get user name
  const userName = data.name || 'Usuario';

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

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

  // Get phase description
  const getPhaseDescription = (phase: string, day: number) => {
    const descriptions: Record<string, string> = {
      menstrual: 'Tu cuerpo se está limpiando. Descansa y cuídate.',
      follicular: 'Tu energía está aumentando. Es un buen momento para actividades activas.',
      ovulatory: 'Días de máxima fertilidad. Tu energía está en su punto más alto.',
      luteal: 'Tu energía puede disminuir ligeramente. Es normal sentirse más introspectiva.',
    };
    return descriptions[phase] || `Día ${day} del ciclo.`;
  };

  // Calculate pregnancy risk (simplified MVP)
  const getPregnancyRisk = () => {
    if (data.wantsPregnancy === false) {
      if (data.cycleType === 'irregular') {
        return { level: 'indeterminado', label: 'No determinado', color: 'gray' };
      }
      if (fertileWindow && cycleDay >= fertileWindow.startDay && cycleDay <= fertileWindow.endDay) {
        return { level: 'high', label: 'Alto', color: 'red' };
      }
      if (phase === 'ovulatory') {
        return { level: 'high', label: 'Alto', color: 'red' };
      }
      if (phase === 'luteal' && cycleDay < cycleLength - 7) {
        return { level: 'medium', label: 'Medio', color: 'orange' };
      }
      return { level: 'low', label: 'Bajo', color: 'green' };
    } else if (data.wantsPregnancy === true) {
      if (fertileWindow && cycleDay >= fertileWindow.startDay && cycleDay <= fertileWindow.endDay) {
        return { level: 'fertile', label: 'Ventana fértil', color: 'purple' };
      }
      return { level: 'normal', label: 'Normal', color: 'blue' };
    }
    return { level: 'low', label: 'Bajo', color: 'green' };
  };

  const resumeInsights = [
    { emoji: "☀️", icon: "Sun", title: "Estado de ánimo", text: "Es normal sentirse más introspectiva hoy.", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { emoji: "💖", icon: "Heart", title: "Recomendación", text: "Ideal para yoga suave o meditación.", iconBg: "bg-purple-100", iconColor: "text-purple-600" }
  ];

  const risk = getPregnancyRisk();

  const progress = 60 // 0–100

  return (
    <View className="flex-1 bg-background">

      {/* Header */}
      <View className="px-4 pt-6 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-500">{getGreeting()}</Text>
          <Text className="text-2xl font-bold text-text-primary">
            Hola, {userName}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Pressable className="h-10 w-10 rounded-full bg-background items-center justify-center">
            <MyIcon name="Bell" size={24} className="text-text-primary fill-white" />
          </Pressable>

          <MyImage
            source={{ uri: "https://i.pravatar.cc/100" }}
            contentFit="contain"
            className="h-10 w-10 rounded-full"
          />
        </View>
      </View>

      {/* Scroll content */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

        {/* Next period card */}
        <View className="mt-6 bg-background rounded-[40px] p-6 items-center">
          <Text className="uppercase text-base font-medium text-text-muted mb-4">
            Próximo periodo
          </Text>

          {/* Circular counter */}
          <View className="w-50 h-50 items-center justify-center">
            <CircularProgress
              value={progress}
              size={180}
              color={colors.lavender}
            />

            <View className="absolute items-center">
              <Text className="text-6xl font-bold text-text-primary">
                5
              </Text>
              <Text className="text-text-muted text-base">días</Text>
            </View>
          </View>

          <Text className="text-lg font-bold mt-4 text-text-primary">
            Jueves, 24 de Octubre
          </Text>

          <View className="mt-2 px-3 py-1 w-fit rounded-full bg-primary/20">
            <Text className="text-primary text-sm font-bold">
              Predicción {data.cycleType === 'regular' ? 'regular' : 'irregular'}
            </Text>
          </View>
        </View>

        {/* Current phase */}
        <View className="w-full mt-6 bg-primary/10 rounded-[32px] p-5 shadow-md border border-primary/10 relative ">
          <View className='w-full h-full absolute inset-0 bg-white/70 m-5 rounded-3xl blur-sm' />

          <View className="flex-row items-center gap-2 mb-3">
            <MyIcon name="Droplet" size={20} className="text-primary fill-primary" />

            <Text className="text-primary font-bold uppercase text-sm">
              Estado actual
            </Text>
          </View>

          <Text className="text-2xl font-bold text-text-primary">
            Fase Lútea
          </Text>

          <Text className="text-text-muted mt-2">
            Día 19 del ciclo. Tu energía puede empezar a disminuir.
          </Text>

          <Pressable className="w-full mt-5 bg-primary py-5 rounded-full items-center justify-center flex-row gap-2">
            <MyIcon name="NotebookPen" size={20} className="text-white " />
            <Text className="text-white font-bold text-base">
              Registrar síntomas
            </Text>
          </Pressable>
        </View>

        {/* Pregnancy risk */}
        <View className="mt-6 flex-row items-center justify-between gap-4 bg-white rounded-[32px] p-5 py-8 shadow-md border border-gray-200">
          <View className="flex-1 flex flex-col gap-4">
            <View className="flex flex-row items-center gap-2">
              <MyIcon name="Smile" size={20} className="text-text-muted" />
              <Text className="text-text-primary text-lg font-bold">
                Riesgo de embarazo
              </Text>
            </View>
            <Text className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-base font-bold">
              <View className="w-2 h-2 mr-1 rounded-full bg-green-500" />{" "}
              Bajo
            </Text>
          </View>
          <View className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <MyIcon name="Shield" size={32} className="text-green-500 fill-green-500" />
          </View>
        </View>

        {/* Insights */}
        <Text className="mt-8 mb-4 text-xl font-bold text-text-primary">
          Resumen de hoy
        </Text>

        <ScrollView className="flex-row gap-4 py-1" horizontal showsHorizontalScrollIndicator={false}>
          {resumeInsights.map((item, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.6}
              className="w-64 mr-4 bg-white p-4 rounded-3xl border border-gray-200 shadow-md"
            >
              <View className={`h-10 w-10 rounded-full ${item.iconBg} items-center justify-center mb-3`}>
                <MyIcon name={item.icon as any} size={20} className={`${item.iconColor} fill-${item.iconColor}`} />
                {/* <Text className="text-2xl">{item.emoji}</Text> */}
              </View>

              <Text className="font-bold text-text-primary">
                {item.title}
              </Text>

              <Text className="text-text-muted mt-1">
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="h-32" />
      </ScrollView>

    </View>
  )
}

