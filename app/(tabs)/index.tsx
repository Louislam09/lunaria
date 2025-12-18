import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';
import { getNextPeriodDate, getCycleDay, getCyclePhase, getFertileWindow } from '@/utils/predictions';
import { formatDate, getDaysUntil } from '@/utils/dates';

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

  const risk = getPregnancyRisk();

  return (
    <View className="flex-1 bg-white">
      {/* Top App Bar */}
      <View className="flex-row items-center bg-white p-4 pb-2 justify-between" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex flex-col">
          <Text className="text-sm text-[#606e8a] font-medium">{getGreeting()}</Text>
          <Text className="text-[#111318] text-2xl font-bold leading-tight tracking-tight">Hola, {userName}</Text>
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
                    {daysUntilPeriod > 0 ? daysUntilPeriod : 0}
                  </Text>
                  <Text className="text-sm font-medium text-[#606e8a] mt-1">días</Text>
                </View>
              </View>
              
              <View className="flex flex-col gap-1 items-center">
                {nextPeriodResult.range ? (
                  <>
                    <Text className="text-[#111318] text-lg font-bold">
                      {formatDate(nextPeriodResult.range.start, 'short')} - {formatDate(nextPeriodResult.range.end, 'short')}
                    </Text>
                    <Text className="text-orange-600 text-sm font-medium bg-orange-100 px-3 py-1 rounded-full">
                      Predicción aproximada
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-[#111318] text-lg font-bold">
                      {formatDate(nextPeriodResult.date, 'long')}
                    </Text>
                    <Text className="text-[#256af4] text-sm font-medium bg-[#256af4]/10 px-3 py-1 rounded-full">
                      Predicción regular
                    </Text>
                  </>
                )}
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
                <Text className="text-[#111318] text-2xl font-bold leading-tight">{getPhaseName(phase)}</Text>
                <Text className="text-[#606e8a] text-base font-normal leading-normal mt-1">
                  {getPhaseDescription(phase, cycleDay)}
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
              <View className={`inline-flex self-start flex-row items-center gap-1.5 px-3 py-1 rounded-full ${
                risk.color === 'green' ? 'bg-green-100' :
                risk.color === 'orange' ? 'bg-orange-100' :
                risk.color === 'red' ? 'bg-red-100' :
                risk.color === 'purple' ? 'bg-purple-100' :
                'bg-gray-100'
              }`}>
                <View className={`w-2 h-2 rounded-full ${
                  risk.color === 'green' ? 'bg-green-500' :
                  risk.color === 'orange' ? 'bg-orange-500' :
                  risk.color === 'red' ? 'bg-red-500' :
                  risk.color === 'purple' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
                <Text className={`text-sm font-bold ${
                  risk.color === 'green' ? 'text-green-700' :
                  risk.color === 'orange' ? 'text-orange-700' :
                  risk.color === 'red' ? 'text-red-700' :
                  risk.color === 'purple' ? 'text-purple-700' :
                  'text-gray-700'
                }`}>{risk.label}</Text>
              </View>
            </View>
            {/* Abstract visual for risk */}
            <View className={`w-16 h-16 rounded-full ${
              risk.color === 'green' ? 'bg-green-50' :
              risk.color === 'orange' ? 'bg-orange-50' :
              risk.color === 'red' ? 'bg-red-50' :
              risk.color === 'purple' ? 'bg-purple-50' :
              'bg-gray-50'
            } flex items-center justify-center`}>
              <Text className="text-3xl">🛡️</Text>
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
                {phase === 'luteal' || phase === 'menstrual' 
                  ? 'Es normal sentirse más introspectiva hoy.'
                  : 'Tu energía está en buen nivel.'}
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
                {phase === 'luteal' || phase === 'menstrual'
                  ? 'Ideal para yoga suave o meditación.'
                  : 'Perfecto para actividades activas.'}
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
    </View>
  );
}

