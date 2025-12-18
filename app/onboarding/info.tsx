import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// DateTimePicker will need to be installed: @react-native-community/datetimepicker
// For now using a simple date input

export default function OnboardingInfoScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('Sofía');
  const [birthDate, setBirthDate] = useState(new Date(1995, 0, 12));
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [lastPeriod, setLastPeriod] = useState<Date | null>(null);
  const [showLastPeriodPicker, setShowLastPeriodPicker] = useState(false);
  const [cycleType, setCycleType] = useState<'regular' | 'irregular'>('regular');
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);

  const formatDate = (date: Date) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <View className="flex-1 bg-[#f5f6f8]">
      {/* Top App Bar */}
      <View className="sticky top-0 z-50 bg-[#f5f6f8]/95 backdrop-blur-md" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3 justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-slate-900 text-lg font-bold flex-1 text-center pr-10">
            Configuración
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View className="px-6 pb-4">
          <View className="flex-row justify-between text-xs font-medium text-slate-500 mb-2">
            <Text className="text-xs text-slate-500">Paso 1 de 3</Text>
            <Text className="text-xs text-slate-500">33%</Text>
          </View>
          <View className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <View className="h-full bg-[#256af4] rounded-full" style={{ width: '33%' }} />
          </View>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32 pt-4" showsVerticalScrollIndicator={false}>
        {/* Section 1: Introduction */}
        <View className="space-y-2 mb-8">
          <Text className="text-3xl font-bold tracking-tight text-slate-900">
            Hablemos de ti
          </Text>
          <Text className="text-slate-500 text-base leading-relaxed">
            Personalicemos tu experiencia. Tus datos se guardan de forma segura solo en este dispositivo.
          </Text>
        </View>

        {/* Section 2: Personal Info Forms */}
        <View className="flex flex-col gap-6 mb-6">
          {/* Name Field */}
          <View className="space-y-2">
            <Text className="block text-sm font-semibold text-slate-700 ml-1">
              ¿Cómo te llamas?
            </Text>
            <TextInput
              className="w-full h-14 px-5 rounded-xl bg-white border border-slate-200 focus:border-[#256af4] text-slate-900 font-medium"
              value={name}
              onChangeText={setName}
              placeholder="María"
            />
          </View>

          {/* Birth Date Field */}
          <View className="space-y-2">
            <Text className="block text-sm font-semibold text-slate-700 ml-1">
              Fecha de Nacimiento
            </Text>
            <Pressable
              onPress={() => setShowBirthDatePicker(true)}
              className="relative flex-row items-center"
            >
              <TextInput
                className="w-full h-14 px-5 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer font-medium"
                value={formatDate(birthDate)}
                editable={false}
              />
              <Text className="absolute right-4 text-slate-400">📅</Text>
            </Pressable>
            {showBirthDatePicker && (
              <Pressable onPress={() => setShowBirthDatePicker(false)}>
                <Text>Date picker - install @react-native-community/datetimepicker</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View className="h-px bg-slate-200 my-6" />

        {/* Section 3: Menstrual Info */}
        <View className="space-y-6 mb-6">
          <Text className="text-2xl font-bold text-slate-900">
            Tu ciclo menstrual
          </Text>

          {/* Last Period Field */}
          <View className="space-y-2">
            <Text className="block text-sm font-semibold text-slate-700 ml-1">
              ¿Cuándo inició tu último periodo?
            </Text>
            <Pressable
              onPress={() => setShowLastPeriodPicker(true)}
              className="relative flex-row items-center"
            >
              <TextInput
                className="w-full h-14 px-5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium uppercase"
                value={lastPeriod ? formatDate(lastPeriod) : ''}
                placeholder="MM/DD/YYYY"
                editable={false}
              />
              <Text className="absolute right-4 text-[#256af4]">✏️</Text>
            </Pressable>
            {showLastPeriodPicker && (
              <Pressable onPress={() => setShowLastPeriodPicker(false)}>
                <Text>Date picker - install @react-native-community/datetimepicker</Text>
              </Pressable>
            )}
          </View>

          {/* Cycle Type Toggle */}
          <View className="space-y-3">
            <Text className="block text-sm font-semibold text-slate-700 ml-1">
              ¿Cómo es tu ciclo?
            </Text>
            <View className="grid grid-cols-2 gap-3 flex-row">
              {/* Regular */}
              <Pressable
                onPress={() => setCycleType('regular')}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  cycleType === 'regular'
                    ? 'border-[#256af4] bg-[#256af4]/5'
                    : 'border-slate-200 bg-white'
                } flex flex-col items-center justify-center gap-2`}
              >
                <View className={`size-8 rounded-full ${
                  cycleType === 'regular' ? 'bg-[#256af4]/20' : 'bg-slate-100'
                } flex items-center justify-center`}>
                  <Text className={cycleType === 'regular' ? 'text-[#256af4]' : 'text-slate-500'}>
                    🔄
                  </Text>
                </View>
                <Text className={`font-bold text-sm ${
                  cycleType === 'regular' ? 'text-[#256af4]' : 'text-slate-500'
                }`}>
                  Regular
                </Text>
                {cycleType === 'regular' && (
                  <Text className="absolute top-2 right-2 text-[#256af4]">✓</Text>
                )}
              </Pressable>

              {/* Irregular */}
              <Pressable
                onPress={() => setCycleType('irregular')}
                className={`flex-1 p-4 rounded-xl border ${
                  cycleType === 'irregular'
                    ? 'border-[#256af4] bg-[#256af4]/5'
                    : 'border-slate-200 bg-white'
                } flex flex-col items-center justify-center gap-2`}
              >
                <View className={`size-8 rounded-full ${
                  cycleType === 'irregular' ? 'bg-[#256af4]/20' : 'bg-slate-100'
                } flex items-center justify-center`}>
                  <Text className={cycleType === 'irregular' ? 'text-[#256af4]' : 'text-slate-500'}>
                    ∞
                  </Text>
                </View>
                <Text className={`font-medium text-sm ${
                  cycleType === 'irregular' ? 'text-[#256af4]' : 'text-slate-500'
                }`}>
                  Irregular
                </Text>
              </Pressable>
            </View>
            <Text className="text-xs text-slate-500 px-1">
              Un ciclo regular suele variar menos de 7 días entre meses.
            </Text>
          </View>
        </View>

        {/* Section 4: Averages Sliders */}
        <View className="space-y-6 pb-6">
          <Text className="text-lg font-bold text-slate-900">
            Los detalles
          </Text>

          {/* Period Length */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-sm font-semibold text-slate-700">
                Duración del sangrado
              </Text>
              <Text className="text-2xl font-bold text-[#256af4]">
                {periodLength} <Text className="text-sm font-normal text-slate-500">días</Text>
              </Text>
            </View>
            {/* Slider would go here - using buttons for now */}
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => (
                <Pressable
                  key={day}
                  onPress={() => setPeriodLength(day)}
                  className={`px-2 py-1 rounded ${periodLength === day ? 'bg-[#256af4]' : 'bg-slate-100'}`}
                >
                  <Text className={periodLength === day ? 'text-white text-xs' : 'text-slate-600 text-xs'}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row justify-between text-xs text-slate-400 mt-2">
              <Text className="text-xs text-slate-400">1 día</Text>
              <Text className="text-xs text-slate-400">10 días</Text>
            </View>
          </View>

          {/* Cycle Length */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-sm font-semibold text-slate-700">
                Duración del ciclo
              </Text>
              <Text className="text-2xl font-bold text-[#256af4]">
                {cycleLength} <Text className="text-sm font-normal text-slate-500">días</Text>
              </Text>
            </View>
            {/* Simplified slider */}
            <View className="flex-row justify-between">
              {[21, 24, 28, 32, 35, 40, 45].map((day) => (
                <Pressable
                  key={day}
                  onPress={() => setCycleLength(day)}
                  className={`px-2 py-1 rounded ${cycleLength === day ? 'bg-[#256af4]' : 'bg-slate-100'}`}
                >
                  <Text className={cycleLength === day ? 'text-white text-xs' : 'text-slate-600 text-xs'}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row justify-between text-xs text-slate-400 mt-2">
              <Text className="text-xs text-slate-400">21 días</Text>
              <Text className="text-xs text-slate-400">45 días</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer / Bottom Navigation */}
      <View className="fixed bottom-0 w-full bg-[#f5f6f8]/80 backdrop-blur-xl border-t border-slate-200 p-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Link href="/onboarding/pregnancy" asChild>
          <Pressable className="w-full h-14 bg-[#256af4] text-white rounded-full font-bold text-lg shadow-lg flex-row items-center justify-center gap-2">
            <Text className="text-white text-lg font-bold">Siguiente</Text>
            <Text className="text-white text-xl">→</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

