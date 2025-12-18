import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, RefreshCw, Infinity, Check, ArrowRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { useOnboarding } from '@/context/OnboardingContext';

export default function OnboardingInfoScreen() {
  const insets = useSafeAreaInsets();
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

  const canContinue = name.trim().length > 0 && lastPeriod !== null;

  const handleContinue = () => {
    if (canContinue) {
      router.push('/onboarding/symptoms');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6f8' }}>
      {/* Top App Bar */}
      <View style={{ paddingTop: insets.top, backgroundColor: '#f5f6f8' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={20} color="#000000" />
          </Pressable>
          <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', paddingRight: 40 }}>
            Paso 1 de 5
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#64748b' }}>Datos personales y ciclo</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#64748b' }}>20%</Text>
          </View>
          <View style={{ height: 4, width: '100%', borderRadius: 9999, backgroundColor: '#cbd5e1', overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: '#256af4', borderRadius: 9999, width: '20%' }} />
          </View>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 128, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {/* Section 1: Introduction */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 30, fontWeight: '700', letterSpacing: -0.5, color: '#0f172a', marginBottom: 8 }}>
            Hablemos de ti
          </Text>
          <Text style={{ color: '#64748b', fontSize: 16, lineHeight: 24 }}>
            Personalicemos tu experiencia. Tus datos se guardan de forma segura solo en este dispositivo.
          </Text>
        </View>

        {/* Section 2: Personal Info Forms */}
        <View style={{ marginBottom: 24 }}>
          {/* Name Field */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 }}>
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
                color: '#0f172a',
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
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 }}>
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
                  color: '#0f172a',
                  fontWeight: '500',
                  fontSize: 16,
                }}
                value={formatDate(birthDate)}
                editable={false}
              />
              <View style={{ position: 'absolute', right: 16 }}>
                <Calendar size={20} color="#94a3b8" />
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
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 24 }}>
            Tu ciclo menstrual
          </Text>

          {/* Last Period Field */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 }}>
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
                  borderColor: lastPeriod ? '#256af4' : '#e2e8f0',
                  color: '#0f172a',
                  fontWeight: '500',
                  fontSize: 16,
                }}
                value={lastPeriod ? formatDate(lastPeriod) : ''}
                placeholder="Selecciona una fecha"
                placeholderTextColor="#94a3b8"
                editable={false}
              />
              <View style={{ position: 'absolute', right: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color={lastPeriod ? '#256af4' : '#94a3b8'} />
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
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 12, marginLeft: 4 }}>
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
                  borderColor: cycleType === 'regular' ? '#256af4' : '#e2e8f0',
                  backgroundColor: cycleType === 'regular' ? 'rgba(37, 106, 244, 0.05)' : '#ffffff',
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
                    backgroundColor: cycleType === 'regular' ? 'rgba(37, 106, 244, 0.2)' : '#f1f5f9',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <RefreshCw size={18} color={cycleType === 'regular' ? '#256af4' : '#64748b'} />
                </View>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 14,
                    color: cycleType === 'regular' ? '#256af4' : '#64748b',
                  }}
                >
                  Regular
                </Text>
                {cycleType === 'regular' && (
                  <View style={{ position: 'absolute', top: 8, right: 8 }}>
                    <Check size={20} color="#256af4" />
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
                  borderColor: cycleType === 'irregular' ? '#256af4' : '#e2e8f0',
                  backgroundColor: cycleType === 'irregular' ? 'rgba(37, 106, 244, 0.05)' : '#ffffff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: cycleType === 'irregular' ? 'rgba(37, 106, 244, 0.2)' : '#f1f5f9',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Infinity size={18} color={cycleType === 'irregular' ? '#256af4' : '#64748b'} />
                </View>
                <Text
                  style={{
                    fontWeight: '500',
                    fontSize: 14,
                    color: cycleType === 'irregular' ? '#256af4' : '#64748b',
                  }}
                >
                  Irregular
                </Text>
              </Pressable>
            </View>
            <Text style={{ fontSize: 12, color: '#64748b', paddingHorizontal: 4 }}>
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
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>
                Duración del sangrado
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#256af4' }}>
                  {periodLength}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '400', color: '#64748b', marginLeft: 4 }}>
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
                minimumTrackTintColor="#256af4"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#256af4"
                style={{ width: '100%', height: 40 }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>1 día</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>10 días</Text>
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
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>
                  Duración promedio del ciclo
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#256af4' }}>
                    {averageCycleLength}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '400', color: '#64748b', marginLeft: 4 }}>
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
                  minimumTrackTintColor="#256af4"
                  maximumTrackTintColor="#e2e8f0"
                  thumbTintColor="#256af4"
                  style={{ width: '100%', height: 40 }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#94a3b8' }}>21 días</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8' }}>45 días</Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', paddingHorizontal: 4 }}>
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
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 16 }}>
                  Rango de duración del ciclo
                </Text>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Mínimo: {cycleRangeMin} días</Text>
                  <Slider
                    value={cycleRangeMin}
                    onValueChange={setCycleRangeMin}
                    minimumValue={21}
                    maximumValue={cycleRangeMax - 1}
                    step={1}
                    minimumTrackTintColor="#256af4"
                    maximumTrackTintColor="#e2e8f0"
                    thumbTintColor="#256af4"
                    style={{ width: '100%', height: 40 }}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Máximo: {cycleRangeMax} días</Text>
                  <Slider
                    value={cycleRangeMax}
                    onValueChange={setCycleRangeMax}
                    minimumValue={cycleRangeMin + 1}
                    maximumValue={45}
                    step={1}
                    minimumTrackTintColor="#256af4"
                    maximumTrackTintColor="#e2e8f0"
                    thumbTintColor="#256af4"
                    style={{ width: '100%', height: 40 }}
                  />
                </View>
              </View>
            </>
          )}
        </View>
        <View style={{ height: 160, backgroundColor: 'transparent', width: '100%' }} />
      </ScrollView>

      {/* Footer / Bottom Navigation */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f5f6f8',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          style={{
            width: '100%',
            height: 56,
            backgroundColor: canContinue ? '#256af4' : '#cbd5e1',
            borderRadius: 9999,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: canContinue ? 1 : 0.6,
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700' }}>Siguiente</Text>
          <ArrowRight size={20} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
