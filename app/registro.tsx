import { KeyboardPaddingView } from "@/components/keyboard-padding";
import MyIcon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { DailyLogsService } from "@/services/dataService";
import { formatDate } from "@/utils/dates";
import { getCycleDay } from "@/utils/predictions";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

enum Moods {
  FELIZ = "feliz",
  TRISTE = "triste",
  IRRITABLE = "irritable",
  SENSIBLE = "sensible",
  ANSIOSA = "ansiosa",
}

enum Symptoms {
  CÓLICOS = "cólicos",
  ACNÉ = "acné",
  FATIGA = "fatiga",
  DOLOR_DE_CABEZA = "dolor de cabeza",
  DOLOR_DE_ESPALDA = "dolor de espalda",
}

enum Flow {
  LEVE = "leve",
  MEDIO = "medio",
  ALTO = "alto",
  MANCHA = "mancha",
}

export default function RegisterScreen() {
  const { data, isLoading, isComplete } = useOnboarding();
  const { user, isAuthenticated, localUserId } = useAuth();
  const [flow, setFlow] = useState(Flow.MEDIO);
  const [moods, setMoods] = useState<Moods[]>([Moods.FELIZ]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Load existing log for selected date
  useEffect(() => {
    const userId = isAuthenticated && user ? user.id : localUserId;
    if (userId) {
      loadExistingLog(userId);
    }
  }, [selectedDate, isAuthenticated, user, localUserId]);

  const loadExistingLog = async (userId: string) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existing = await DailyLogsService.getByDate(userId, dateStr);
      if (existing) {
        setFlow(existing.flow as Flow);
        setMoods(existing.mood ? existing.mood.split(',') as Moods[] : [Moods.FELIZ]);
        setSymptoms(existing.symptoms);
        setNotes(existing.notes);
      } else {
        // Reset to defaults
        setFlow(Flow.MEDIO);
        setMoods([Moods.FELIZ]);
        setSymptoms([]);
        setNotes("");
      }
    } catch (error) {
      console.error('Failed to load existing log:', error);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => scrollViewRef.current?.scrollToEnd({ animated: true })
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const toggleMood = (mood: Moods) => {
    setMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const flowOptions = [
    { label: "Leve", value: Flow.LEVE },
    { label: "Medio", value: Flow.MEDIO },
    { label: "Alto", value: Flow.ALTO },
    { label: "Mancha", value: Flow.MANCHA },
  ];

  const moodOptions = [
    { key: Moods.FELIZ, label: "Feliz", icon: 'Smile', color: "text-[#facc15]", border: "border-[#facc15]" },
    { key: Moods.TRISTE, label: "Triste", icon: 'Frown', color: "text-[#256af4]", border: "border-[#256af4]" },
    { key: Moods.IRRITABLE, label: "Irritable", icon: 'Angry', color: "text-[#ef4444]", border: "border-[#ef4444]" },
    { key: Moods.SENSIBLE, label: "Sensible", icon: 'Droplet', color: "text-[#60a5fa]", border: "border-[#60a5fa]" },
    { key: Moods.ANSIOSA, label: "Ansiosa", icon: 'CircleAlert', color: "text-[#a855f7]", border: "border-[#a855f7]" }
  ];

  const symptomOptions = [
    { label: Symptoms.CÓLICOS, icon: 'Activity' },
    { label: Symptoms.ACNÉ, icon: 'CircleAlert' },
    { label: Symptoms.FATIGA, icon: 'BatteryLow' },
    { label: Symptoms.DOLOR_DE_CABEZA, icon: 'Brain' },
    { label: Symptoms.DOLOR_DE_ESPALDA, icon: 'Activity' },
  ]

  const toggleSymptom = (symptom: Symptoms) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom.toString()) : [...prev, symptom.toString()]
    );
  };

  const handleSave = async () => {
    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) {
      Alert.alert(
        'Error',
        'No se pudo identificar el usuario.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      await DailyLogsService.save({
        user_id: userId,
        date: dateStr,
        symptoms: symptoms,
        flow: flow,
        mood: moods.join(','),
        notes: notes,
      });

      Alert.alert(
        'Guardado',
        'Registro guardado correctamente.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Save failed:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar el registro. Intenta más tarde.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }} />
      <View className="flex-1 bg-background">
        {/* Top App Bar */}
        <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
          <Pressable
            onPress={() => navigateDate('prev')}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <MyIcon name="ChevronLeft" size={26} className="text-text-primary" />
          </Pressable>
          <Pressable
            onPress={goToToday}
            className="items-center flex-1"
          >
            <Text className="text-lg font-bold text-text-primary">
              {formatDate(selectedDate, 'long')}
            </Text>
            <Text className="text-sm font-bold uppercase tracking-wider text-primary">
              Día {getCycleDay(data.lastPeriodStart || selectedDate)} del ciclo
            </Text>
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <Text className="text-xs text-text-muted mt-1">
                Toca para ir a hoy
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => navigateDate('next')}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <MyIcon name="ChevronRight" size={26} className="text-text-primary" />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-4"
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
        >
          <View className="h-24" />
          {/* Prediction */}
          <View className="flex-row items-center bg-primary/30 rounded-2xl p-4 gap-3 border border-primary/60 shadow-md">
            <MyIcon name="Sparkles" size={18} className="text-primary" />
            <Text className="text-base font-medium text-text-primary">
              Predicción: Posible inicio de periodo hoy.
            </Text>
          </View>

          {/* Menstruación */}
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3 text-text-primary">
              Menstruación
            </Text>
            <View className="flex-row bg-background rounded-full p-1.5 border border-gray-200 shadow-md">
              {flowOptions.map(({ label, value }) => (
                <Pressable
                  key={value}
                  onPress={() => setFlow(value)}
                  className={`flex-1 py-2.5 rounded-full ${flow === value ? "bg-primary" : ""
                    }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${flow === value
                      ? "text-white"
                      : "text-text-muted"
                      }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          {/* Estado de ánimo */}
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3 text-text-primary">
              Estado de Ánimo
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-4 py-1" className="-mx-4 ">
              <View className="flex-row gap-3">
                {moodOptions.map(({ key, label, icon: IconName, color, border }) => {
                  const active = moods.includes(key);
                  return (
                    <TouchableOpacity activeOpacity={0.6}
                      key={key}
                      onPress={() => toggleMood(key)}
                      className={`w-20 h-24 shadow-md rounded-2xl items-center justify-center gap-2 border ${active
                        ? `bg-primary/10 border-primary`
                        : "border-gray-200 bg-background"
                        }`}
                    >
                      <MyIcon
                        name={IconName as any}
                        size={28}
                        className={color}
                      />
                      <Text
                        className={`text-sm ${active
                          ? `font-bold text-`
                          : "font-medium text-text-muted"
                          }`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
          {/* Síntomas */}
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3 text-text-primary">
              Síntomas Físicos
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {symptomOptions.map(({ label, icon: Icon }) => (
                <TouchableOpacity activeOpacity={0.6}
                  onPress={() => toggleSymptom(label)}
                  key={label}
                  className={`flex-row items-center gap-2 px-4 py-3 rounded-full bg-background border border-gray-200 shadow-md ${symptoms.includes(label) ? "bg-primary border-primary" : "bg-background border-gray-200"}`}
                >
                  <MyIcon name={Icon as any} size={16} className={symptoms.includes(label) ? "text-white" : "text-text-primary"} />
                  <Text className={`text-sm font-medium ${symptoms.includes(label) ? "text-white" : "text-text-primary"}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Notas */}
          <View className="my-6">
            <Text className="text-lg font-bold mb-3 text-text-primary">
              Notas
            </Text>
            <View className="relative h-[100px] bg-background w-full px-4  rounded-2xl text-text-primary shadow-md border border-blue-400">
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="¿Algo más que notar hoy?"
                placeholderTextColor="text-text-muted"
                className="relative h-full w-full"
                style={{ textAlignVertical: 'top', textAlign: 'left' }}
                value={notes}
                onChangeText={setNotes}
              />
              <View className="absolute bottom-3 right-3">
                <MyIcon name="PencilLine" size={18} className="text-primary" />
              </View>
            </View>
          </View>
          {/* Save */}
        </ScrollView>
        <View className="px-4 absolute bottom-0 left-0 right-0 z-20 flex-row items-center justify-between pt-6 pb-2 bg-background/90 backdrop-blur-sm">
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleSave}
            disabled={isSaving}
            className={`w-full mt-5 py-5 rounded-full items-center justify-center flex-row gap-2 ${isSaving ? 'bg-gray-400' : 'bg-primary'
              }`}
          >
            {isSaving ? (
              <>
                <MyIcon name="Loader" size={20} className="text-white" />
                <Text className="text-white font-bold text-base">
                  Guardando...
                </Text>
              </>
            ) : (
              <>
                <MyIcon name="Check" size={20} className="text-white" />
                <Text className="text-white font-bold text-base">
                  Guardar Registro
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardPaddingView />
    </View>
  );
}
