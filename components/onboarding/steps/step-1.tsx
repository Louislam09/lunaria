import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Calendar, Check, Infinity, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function Step1() {
  const { data, updateData } = useOnboarding();

  const [name, setName] = useState(data.name || '');
  const [birthDate, setBirthDate] = useState(data.birthDate || new Date(2000, 0, 1));
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [lastPeriod, setLastPeriod] = useState<Date | null>(data.lastPeriodStart || null);
  const [showLastPeriodPicker, setShowLastPeriodPicker] = useState(false);
  const [cycleType, setCycleType] = useState<'regular' | 'irregular'>(data.cycleType || 'regular');
  const [periodLength, setPeriodLength] = useState(data.periodLength || 5);
  const [averageCycleLength, setAverageCycleLength] = useState(data.averageCycleLength || 28);
  const [cycleRangeMin, setCycleRangeMin] = useState(data.cycleRangeMin || 21);
  const [cycleRangeMax, setCycleRangeMax] = useState(data.cycleRangeMax || 35);

  // Update context when local state changes
  useEffect(() => {
    const updates: any = {
      name,
      birthDate,
      cycleType,
      periodLength,
    };

    if (lastPeriod) {
      updates.lastPeriodStart = lastPeriod;
    }

    if (cycleType === 'regular') {
      updates.averageCycleLength = averageCycleLength;
      updates.cycleRangeMin = undefined;
      updates.cycleRangeMax = undefined;
    } else {
      updates.cycleRangeMin = cycleRangeMin;
      updates.cycleRangeMax = cycleRangeMax;
      updates.averageCycleLength = undefined;
    }

    updateData(updates);
  }, [name, birthDate, lastPeriod, cycleType, periodLength, averageCycleLength, cycleRangeMin, cycleRangeMax]);

  const formatDate = (date: Date) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Section 1: Introduction */}
      <View className='mb-8'>
        <Text
          className='text-3xl font-bold tracking-tight text-text-primary mb-2'
        >
          Hablemos de ti
        </Text>
        <Text
          className='text-base text-text-muted leading-6'
        >
          Personalicemos tu experiencia. Tus datos se guardan de forma segura solo en este dispositivo.
        </Text>
      </View>

      {/* Section 2: Personal Info Forms */}
      <View className='mb-8'>
        {/* Name Field */}
        <View className='mb-8'>
          <Text
            className='text-base font-bold text-text-primary mb-2 ml-1'
          >
            ¿Cómo te llamas?
          </Text>
          <TextInput
            style={{
              width: '100%',
              height: 56,
              paddingHorizontal: 20,
              borderRadius: 12,
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              color: colors.textPrimary,
              fontWeight: '500',
              fontSize: 16,
            }}
            value={name}
            onChangeText={setName}
            placeholder="María"
          />
        </View>

        {/* Birth Date Field */}
        <View>
          <Text
            className='text-base font-bold text-text-primary mb-2 ml-1'
          >
            Fecha de Nacimiento
          </Text>
          <Pressable
            onPress={() => setShowBirthDatePicker(true)}
            className='relative flex-row items-center'
          >
            <TextInput
              style={{
                width: '100%',
                height: 56,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                color: colors.textPrimary,
                fontWeight: '500',
                fontSize: 16,
              }}
              value={formatDate(birthDate)}
              editable={false}
            />
            <View className='absolute right-4'>
              <Calendar size={20} color={colors.textMuted} />
            </View>
          </Pressable>
          {showBirthDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowBirthDatePicker(false);
                }
                if (event.type !== 'dismissed' && selectedDate) {
                  setBirthDate(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
          {Platform.OS === 'ios' && showBirthDatePicker && (
            <Pressable
              onPress={() => setShowBirthDatePicker(false)}
              className='mt-2.5 p-2.5 bg-gray-100 rounded-lg'
            >
              <Text style={{ textAlign: 'center', fontWeight: '600' }}>Done</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 24 }} />

      {/* Section 3: Menstrual Info */}
      <View className='mb-8'>
        <Text className='text-2xl font-bold tracking-tight text-text-primary mb-6'>
          Tu ciclo menstrual
        </Text>

        {/* Last Period Field */}
        <View className='mb-8'>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, marginLeft: 4 }}>
            ¿Cuándo inició tu último periodo?
          </Text>
          <Pressable
            onPress={() => setShowLastPeriodPicker(true)}
            style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}
          >
            <TextInput
              style={{
                width: '100%',
                height: 56,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: lastPeriod ? colors.lavender : '#e2e8f0',
                color: colors.textPrimary,
                fontWeight: '500',
                fontSize: 16,
              }}
              value={lastPeriod ? formatDate(lastPeriod) : ''}
              placeholder="Selecciona una fecha"
              placeholderTextColor={colors.textMuted}
              editable={false}
            />
            <View className='absolute right-4 items-center justify-center'>
              <Calendar size={18} color={lastPeriod ? colors.lavender : colors.textMuted} />
            </View>
          </Pressable>
          {showLastPeriodPicker && (
            <DateTimePicker
              value={lastPeriod || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowLastPeriodPicker(false);
                }
                if (event.type !== 'dismissed' && selectedDate) {
                  setLastPeriod(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
          {Platform.OS === 'ios' && showLastPeriodPicker && (
            <Pressable
              onPress={() => setShowLastPeriodPicker(false)}
              className='mt-2.5 p-2.5 bg-gray-100 rounded-lg'
            >
              <Text className='text-center font-bold'>Done</Text>
            </Pressable>
          )}
        </View>

        {/* Cycle Type Toggle */}
        <View className='mb-8'>
          <Text className='text-base font-bold text-text-primary mb-3 ml-1'>
            ¿Cómo es tu ciclo?
          </Text>
          <View className='flex-row gap-3 mb-2'>
            {/* Regular */}
            <Pressable
              onPress={() => setCycleType('regular')}
              className={`flex-1 p-4 rounded-2xl border-2 
              ${cycleType === 'regular' ? 'border-primary' : 'border-gray-200'} bg-white items-center justify-center relative`}
            >
              <View className={`size-8 rounded-full ${cycleType === 'regular' ? 'bg-primary/33' : 'bg-gray-200'} items-center justify-center mb-2`}  >
                <RefreshCw size={18} color={cycleType === 'regular' ? colors.lavender : colors.textMuted} />
              </View>
              <Text className={`text-base font-bold ${cycleType === 'regular' ? 'text-primary' : 'text-text-muted'}`}  >
                Regular
              </Text>

              <View
                className={`absolute top-3 right-3 size-5 rounded-full border-2 
               flex items-center justify-center transition-colors ${cycleType === 'regular' ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent'}`}
              >
                {cycleType === 'regular' && (
                  <Check size={20} color={colors.moonWhite} strokeWidth={4} />
                )}
              </View>
            </Pressable>

            {/* Irregular */}
            <Pressable
              onPress={() => setCycleType('irregular')}
              className={`flex-1 p-4 rounded-2xl border-2 
                ${cycleType === 'irregular' ? 'border-primary' : 'border-gray-200'} bg-white items-center justify-center relative`}
            >
              <View
                className={`size-8 rounded-full ${cycleType === 'irregular' ? 'bg-primary/33' : 'bg-gray-200'} items-center justify-center mb-2`}
              >
                <Infinity size={18} color={cycleType === 'irregular' ? colors.lavender : colors.textMuted} />
              </View>
              <Text
                className={`text-base font-bold ${cycleType === 'irregular' ? 'text-primary' : 'text-text-muted'}`}
              >
                Irregular
              </Text>
              <View
                className={`absolute top-3 right-3 size-5 rounded-full border-2 
               flex items-center justify-center transition-colors ${cycleType === 'irregular' ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent'}`}
              >
                {cycleType === 'irregular' && (
                  <Check size={20} color={colors.moonWhite} strokeWidth={4} />
                )}
              </View>
            </Pressable>
          </View>
          <Text className='text-sm text-text-muted px-1' >
            Un ciclo regular suele variar menos de 7 días entre meses.
          </Text>
        </View>

        {/* Period Length */}
        <View
          className='bg-white p-5 rounded-2xl border border-gray-200 mb-4'
        >
          <View className='flex-row justify-between items-end mb-4' >
            <Text className='text-base font-bold text-text-primary' >
              Duración del sangrado
            </Text>
            <View className='flex-row items-baseline' >
              <Text className='text-2xl font-bold text-primary' >
                {periodLength}
              </Text>
              <Text className='text-base font-medium text-text-muted ml-1' >
                días
              </Text>
            </View>
          </View>
          <View className='mt-4 mb-2' >
            <Slider
              value={periodLength}
              onValueChange={setPeriodLength}
              minimumValue={1}
              maximumValue={10}
              step={1}
              minimumTrackTintColor={colors.lavender}
              maximumTrackTintColor="#e2e8f0"
              thumbTintColor={colors.lavender}
              style={{ width: '100%', height: 40 }}
            />
            <View className='flex-row justify-between mt-2' >
              <Text className='text-sm text-text-muted' >1 día</Text>
              <Text className='text-sm text-text-muted' >10 días</Text>
            </View>
          </View>
        </View>

        {/* Cycle Length - Conditional based on cycleType */}
        {cycleType === 'regular' ? (
          <View
            className='bg-white p-5 rounded-2xl border border-gray-200'
          >
            <View className='flex-row justify-between items-end mb-4' >
              <Text className='text-base font-bold text-text-primary' >
                Duración promedio del ciclo
              </Text>
              <View className='flex-row items-baseline' >
                <Text className='text-2xl font-bold text-primary' >
                  {averageCycleLength}
                </Text>
                <Text className='text-base font-medium text-text-muted ml-1' >
                  días
                </Text>
              </View>
            </View>
            <View className='mt-4 mb-2' >
              <Slider
                value={averageCycleLength}
                onValueChange={setAverageCycleLength}
                minimumValue={21}
                maximumValue={45}
                step={1}
                minimumTrackTintColor={colors.lavender}
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor={colors.lavender}
                style={{ width: '100%', height: 40 }}
              />
              <View className='flex-row justify-between mt-2' >
                <Text className='text-sm text-text-muted' >21 días</Text>
                <Text className='text-sm text-text-muted' >45 días</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View className='mb-3' >
              <Text className='text-sm text-text-muted italic px-1' >
                Lunaria usará rangos aproximados y aprenderá con tus registros.
              </Text>
            </View>
            <View
              className='bg-white p-5 rounded-2xl border border-gray-200 mb-4'
            >
              <Text className='text-base font-bold text-text-primary mb-4' >
                Rango de duración del ciclo
              </Text>
              <View className='mb-4' >
                <Text className='text-sm text-text-muted mb-2' >Mínimo: {cycleRangeMin} días</Text>
                <Slider
                  value={cycleRangeMin}
                  onValueChange={setCycleRangeMin}
                  minimumValue={21}
                  maximumValue={cycleRangeMax - 1}
                  step={1}
                  minimumTrackTintColor={colors.lavender}
                  maximumTrackTintColor="#e2e8f0"
                  thumbTintColor={colors.lavender}
                  style={{ width: '100%', height: 40 }}
                />
              </View>
              <View>
                <Text className='text-sm text-text-muted mb-2' >Máximo: {cycleRangeMax} días</Text>
                <Slider
                  value={cycleRangeMax}
                  onValueChange={setCycleRangeMax}
                  minimumValue={cycleRangeMin + 1}
                  maximumValue={45}
                  step={1}
                  minimumTrackTintColor={colors.lavender}
                  maximumTrackTintColor="#e2e8f0"
                  thumbTintColor={colors.lavender}
                  style={{ width: '100%', height: 40 }}
                />
              </View>
            </View>
          </>
        )}
      </View>
      <View style={{ height: 100, backgroundColor: 'transparent', width: '100%' }} />
    </View>
  );
}
