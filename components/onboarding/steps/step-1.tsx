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
            className='text-base font-medium text-text-primary mb-2 ml-1'
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
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, marginLeft: 4 }}>
            Fecha de Nacimiento
          </Text>
          <Pressable
            onPress={() => setShowBirthDatePicker(true)}
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
                borderColor: '#e2e8f0',
                color: colors.textPrimary,
                fontWeight: '500',
                fontSize: 16,
              }}
              value={formatDate(birthDate)}
              editable={false}
            />
            <View style={{ position: 'absolute', right: 16 }}>
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
              style={{ marginTop: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600' }}>Done</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 24 }} />

      {/* Section 3: Menstrual Info */}
      <View className='mb-8'>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 24 }}>
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
            <View style={{ position: 'absolute', right: 16, alignItems: 'center', justifyContent: 'center' }}>
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
              style={{ marginTop: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600' }}>Done</Text>
            </Pressable>
          )}
        </View>

        {/* Cycle Type Toggle */}
        <View className='mb-8'>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 12, marginLeft: 4 }}>
            ¿Cómo es tu ciclo?
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
            {/* Regular */}
            <Pressable
              onPress={() => setCycleType('regular')}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                borderWidth: cycleType === 'regular' ? 2 : 1,
                borderColor: cycleType === 'regular' ? colors.lavender : '#e2e8f0',
                backgroundColor: cycleType === 'regular' ? `${colors.lavender}15` : '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: cycleType === 'regular' ? `${colors.lavender}33` : '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <RefreshCw size={18} color={cycleType === 'regular' ? colors.lavender : colors.textMuted} />
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 14,
                  color: cycleType === 'regular' ? colors.lavender : colors.textMuted,
                }}
              >
                Regular
              </Text>
              {cycleType === 'regular' && (
                <View style={{ position: 'absolute', top: 8, right: 8 }}>
                  <Check size={20} color={colors.lavender} />
                </View>
              )}
            </Pressable>

            {/* Irregular */}
            <Pressable
              onPress={() => setCycleType('irregular')}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                borderWidth: cycleType === 'irregular' ? 2 : 1,
                borderColor: cycleType === 'irregular' ? colors.lavender : '#e2e8f0',
                backgroundColor: cycleType === 'irregular' ? `${colors.lavender}15` : '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: cycleType === 'irregular' ? `${colors.lavender}33` : '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Infinity size={18} color={cycleType === 'irregular' ? colors.lavender : colors.textMuted} />
              </View>
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: cycleType === 'irregular' ? colors.lavender : colors.textMuted,
                }}
              >
                Irregular
              </Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: 12, color: colors.textMuted, paddingHorizontal: 4 }}>
            Un ciclo regular suele variar menos de 7 días entre meses.
          </Text>
        </View>

        {/* Period Length */}
        <View
          style={{
            backgroundColor: '#ffffff',
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              Duración del sangrado
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.lavender }}>
                {periodLength}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '400', color: colors.textMuted, marginLeft: 4 }}>
                días
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 16, marginBottom: 8 }}>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>1 día</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>10 días</Text>
            </View>
          </View>
        </View>

        {/* Cycle Length - Conditional based on cycleType */}
        {cycleType === 'regular' ? (
          <View
            style={{
              backgroundColor: '#ffffff',
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                Duración promedio del ciclo
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.lavender }}>
                  {averageCycleLength}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '400', color: colors.textMuted, marginLeft: 4 }}>
                  días
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 16, marginBottom: 8 }}>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>21 días</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>45 días</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: colors.textMuted, fontStyle: 'italic', paddingHorizontal: 4 }}>
                Lunaria usará rangos aproximados y aprenderá con tus registros.
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
                Rango de duración del ciclo
              </Text>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>Mínimo: {cycleRangeMin} días</Text>
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
                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>Máximo: {cycleRangeMax} días</Text>
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
      <View style={{ height: 200, backgroundColor: 'transparent', width: '100%' }} />
    </View>
  );
}
