import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// DateTimePicker will need to be installed: @react-native-community/datetimepicker

export default function RegistroScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [flow, setFlow] = useState<'leve' | 'medio' | 'alto' | 'mancha' | null>('medio');
  const [moods, setMoods] = useState<string[]>(['triste']);
  const [symptoms, setSymptoms] = useState<string[]>(['cólicos']);
  const [notes, setNotes] = useState('');

  const flowOptions = [
    { id: 'leve', label: 'Leve' },
    { id: 'medio', label: 'Medio' },
    { id: 'alto', label: 'Alto' },
    { id: 'mancha', label: 'Mancha' },
  ];

  const moodOptions = [
    { id: 'feliz', label: 'Feliz', icon: '😊', color: 'yellow' },
    { id: 'triste', label: 'Triste', icon: '😢', color: 'blue' },
    { id: 'irritable', label: 'Irritable', icon: '😠', color: 'red' },
    { id: 'sensible', label: 'Sensible', icon: '💧', color: 'blue' },
    { id: 'ansiosa', label: 'Ansiosa', icon: '😰', color: 'purple' },
  ];

  const symptomOptions = [
    { id: 'cólicos', label: 'Cólicos', icon: '🌿' },
    { id: 'headache', label: 'Dolor de cabeza', icon: '🧠' },
    { id: 'acne', label: 'Acné', icon: '😐' },
    { id: 'back', label: 'Dolor de espalda', icon: '👤' },
    { id: 'fatigue', label: 'Fatiga', icon: '🔋' },
  ];

  const toggleMood = (id: string) => {
    setMoods(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleSymptom = (id: string) => {
    setSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <View className="flex-1 bg-[#f5f6f8] pb-28">
      {/* Top App Bar */}
      <View className="sticky top-0 z-20 bg-[#f5f6f8]/90 backdrop-blur-md border-b border-slate-200" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center p-4 justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl">←</Text>
          </Pressable>
          <View className="flex flex-col items-center">
            <Text className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
              {formatDate(selectedDate)}
            </Text>
            <Text className="text-xs font-medium text-[#256af4] uppercase tracking-wider">
              Ciclo Día 14
            </Text>
          </View>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <Text className="text-2xl">→</Text>
          </Pressable>
        </View>
        {showDatePicker && (
          <Pressable onPress={() => setShowDatePicker(false)}>
            <Text>Date picker - install @react-native-community/datetimepicker</Text>
          </Pressable>
        )}
      </View>

      {/* Main Content */}
      <ScrollView className="flex flex-col px-4 pt-4 gap-6" showsVerticalScrollIndicator={false}>
        {/* Prediction Message */}
        <View className="bg-[#256af4]/10 rounded-2xl p-4 flex-row items-center gap-3 border border-[#256af4]/20">
          <Text className="text-[#256af4] text-xl">✨</Text>
          <Text className="text-sm text-slate-700 font-medium">
            Predicción: Posible inicio de periodo hoy.
          </Text>
        </View>

        {/* Section: Menstruation Flow */}
        <View>
          <Text className="text-slate-900 text-lg font-bold mb-3 px-1">Menstruación</Text>
          <View className="bg-white rounded-xl p-1.5 shadow-sm border border-slate-100">
            <View className="flex-row">
              {flowOptions.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setFlow(option.id as any)}
                  className={`flex-1 items-center justify-center py-2.5 rounded-lg ${
                    flow === option.id
                      ? 'bg-[#256af4]'
                      : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    flow === option.id ? 'text-white' : 'text-slate-500'
                  }`}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Section: Mood */}
        <View>
          <Text className="text-slate-900 text-lg font-bold mb-3 px-1">Estado de Ánimo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 -mx-4 px-4">
            {moodOptions.map((mood) => {
              const isSelected = moods.includes(mood.id);
              return (
                <Pressable
                  key={mood.id}
                  onPress={() => toggleMood(mood.id)}
                  className={`flex flex-col items-center justify-center w-20 h-24 gap-2 rounded-2xl bg-white border ${
                    isSelected
                      ? 'border-[#256af4] bg-[#256af4]/5'
                      : 'border-slate-100'
                  }`}
                >
                  <Text className={`text-3xl ${isSelected ? 'scale-110' : ''}`}>
                    {mood.icon}
                  </Text>
                  <Text className={`text-xs font-medium ${
                    isSelected ? 'text-[#256af4] font-bold' : 'text-slate-600'
                  }`}>
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Section: Symptoms */}
        <View>
          <Text className="text-slate-900 text-lg font-bold mb-3 px-1">Síntomas Físicos</Text>
          <View className="flex-row flex-wrap gap-2">
            {symptomOptions.map((symptom) => {
              const isSelected = symptoms.includes(symptom.id);
              return (
                <Pressable
                  key={symptom.id}
                  onPress={() => toggleSymptom(symptom.id)}
                  className={`flex-row items-center gap-2 px-4 py-2 rounded-full bg-white border ${
                    isSelected
                      ? 'bg-[#256af4] border-[#256af4]'
                      : 'border-slate-200'
                  } shadow-sm`}
                >
                  <Text className="text-lg">{symptom.icon}</Text>
                  <Text className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-slate-600'
                  }`}>
                    {symptom.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section: Notes */}
        <View>
          <Text className="text-slate-900 text-lg font-bold mb-3 px-1">Notas</Text>
          <View className="relative">
            <TextInput
              className="w-full bg-white border-none rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#256af4] shadow-sm"
              placeholder="¿Algo más que notar hoy?"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              style={{ minHeight: 100 }}
            />
            <View className="absolute bottom-3 right-3 pointer-events-none">
              <Text className="text-slate-400 text-xl">✏️</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <Pressable className="w-full bg-[#256af4] text-white font-bold py-4 rounded-full shadow-lg mt-2 flex-row items-center justify-center gap-2">
          <Text className="text-white text-xl">✓</Text>
          <Text className="text-white font-bold">Guardar Registro</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 pb-safe" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-around items-center h-16">
          <Link href="/calendar" asChild>
            <Pressable className="flex flex-col items-center justify-center w-full h-full gap-1">
              <Text className="text-2xl text-slate-400">📅</Text>
              <Text className="text-[10px] font-medium text-slate-400">Calendario</Text>
            </Pressable>
          </Link>

          <Pressable className="flex flex-col items-center justify-center w-full h-full gap-1 text-[#256af4]">
            <Text className="text-2xl font-bold text-[#256af4]">📝</Text>
            <Text className="text-[10px] font-bold text-[#256af4]">Registro</Text>
          </Pressable>

          <Link href="/predictions" asChild>
            <Pressable className="flex flex-col items-center justify-center w-full h-full gap-1">
              <Text className="text-2xl text-slate-400">📊</Text>
              <Text className="text-[10px] font-medium text-slate-400">Reportes</Text>
            </Pressable>
          </Link>

          <Link href="/settings" asChild>
            <Pressable className="flex flex-col items-center justify-center w-full h-full gap-1">
              <Text className="text-2xl text-slate-400">⚙️</Text>
              <Text className="text-[10px] font-medium text-slate-400">Ajustes</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

