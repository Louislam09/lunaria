import { KeyboardPaddingView } from "@/components/keyboard-padding";
import MyIcon from "@/components/ui/Icon";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { DailyLogsService } from "@/services/dataService";
import { colors } from "@/utils/colors";
import { formatDate } from "@/utils/dates";
import { getCycleDay } from "@/utils/predictions";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop, } from "react-native-svg";

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
  PECHOS_SENSIBLES = "pechos sensibles",
  NÁUSEAS = "náuseas",
  VÓMITO = "vómito",
  HINCHAZÓN = "hinchazón",
  ESTREÑIMIENTO = "estreñimiento",
  DIARREA = "diarrea",
}

enum Flow {
  NINGUNO = "ninguno",
  LEVE = "leve",
  MEDIO = "medio",
  ALTO = "alto",
  MANCHA = "mancha",
}

const dropColor = "#fe315b";

// react native svg
const flowIcons = {
  // empty drop - no droplets, just outline
  [Flow.NINGUNO]: <Svg width="48" height="48" viewBox="0 0 48 48">
    <Path d="M24 2C24 2 8 20 8 32a16 16 0 0032 0C40 20 24 2 24 2z" fill="none" stroke={colors.textMuted} strokeWidth="1.5" />
  </Svg>,
  // 1 drop - single centered droplet
  [Flow.LEVE]: <Svg width="48" height="48" viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="gradientLeve" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.9" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.7" />
      </LinearGradient>
    </Defs>
    <Path d="M24 2C24 2 8 20 8 32a16 16 0 0032 0C40 20 24 2 24 2z" fill="url(#gradientLeve)" />
  </Svg>,
  // 2 drops - one larger bottom-left, one smaller top-right
  [Flow.MEDIO]: <Svg width="48" height="48" viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="gradientMedio1" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.9" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.7" />
      </LinearGradient>
      <LinearGradient id="gradientMedio2" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.6" />
      </LinearGradient>
    </Defs>
    <Path d="M16 28C16 28 6 38 6 44a10 10 0 0020 0C26 38 16 28 16 28z" fill="url(#gradientMedio1)" />
    <Path d="M30 8C30 8 22 16 22 20a8 8 0 0016 0C38 16 30 8 30 8z" fill="url(#gradientMedio2)" />
  </Svg>,
  // 3 drops - large top-left, medium top-right, small bottom-center
  [Flow.ALTO]: <Svg width="48" height="48" viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="gradientAlto1" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.95" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.75" />
      </LinearGradient>
      <LinearGradient id="gradientAlto2" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.85" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.65" />
      </LinearGradient>
      <LinearGradient id="gradientAlto3" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.6" />
      </LinearGradient>
    </Defs>
    <Path d="M12 4C12 4 2 16 2 24a10 10 0 0020 0C22 16 12 4 12 4z" fill="url(#gradientAlto1)" />
    <Path d="M30 8C30 8 22 16 22 22a8 8 0 0016 0C38 16 30 8 30 8z" fill="url(#gradientAlto2)" />
    <Path d="M24 32C24 32 20 36 20 40a4 4 0 008 0C28 36 24 32 24 32z" fill="url(#gradientAlto3)" />
  </Svg>,
  // 4 drops - large top-center, two medium left/right, small bottom-center
  [Flow.MANCHA]: <Svg width="48" height="48" viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="gradientMancha1" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.95" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.75" />
      </LinearGradient>
      <LinearGradient id="gradientMancha2" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.85" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.65" />
      </LinearGradient>
      <LinearGradient id="gradientMancha3" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={dropColor} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={dropColor} stopOpacity="0.6" />
      </LinearGradient>
    </Defs>
    <Path d="M24 6C24 6 14 18 14 26a10 10 0 0020 0C34 18 24 6 24 6z" fill="url(#gradientMancha1)" />
    <Path d="M10 30C10 30 5 35 5 39a5 5 0 0010 0C15 35 10 30 10 30z" fill="url(#gradientMancha2)" />
    <Path d="M38 30C38 30 33 35 33 39a5 5 0 0010 0C43 35 38 30 38 30z" fill="url(#gradientMancha2)" />
    <Path d="M24 38C24 38 21 41 21 44a3 3 0 006 0C27 41 24 38 24 38z" fill="url(#gradientMancha3)" />
  </Svg>,
}

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ date?: string; id?: string }>();
  const { data, isLoading, isComplete, updateData } = useOnboarding();
  const { user, isAuthenticated, localUserId } = useAuth();
  const { alertError, alertSuccess, confirm } = useAlert();
  const [flow, setFlow] = useState<Flow | undefined>(undefined);
  const [moods, setMoods] = useState<Moods[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize with date from params if provided
    if (params.date) {
      return new Date(params.date);
    }
    return new Date();
  });
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

  // Update selectedDate when params.date changes
  useEffect(() => {
    if (params.date) {
      const dateFromParams = new Date(params.date);
      setSelectedDate(dateFromParams);
    }
  }, [params.date]);

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
        setFlow(existing.flow ? (existing.flow as Flow) : undefined);
        setMoods(existing.mood ? existing.mood.split(',') as Moods[] : []);
        setSymptoms(existing.symptoms);
        setNotes(existing.notes);
      } else {
        // Reset to empty
        setFlow(undefined);
        setMoods([]);
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
    { label: "Ninguno", value: Flow.NINGUNO, icon: 'Droplet' },
    { label: "Leve", value: Flow.LEVE, icon: 'Droplet' },
    { label: "Medio", value: Flow.MEDIO, icon: 'Droplet' },
    { label: "Alto", value: Flow.ALTO, icon: 'Droplet' },
    { label: "Mancha", value: Flow.MANCHA, icon: 'Droplet' },
  ];

  const moodOptions = [
    { key: Moods.FELIZ, label: "Feliz", emoji: '😁', color: "text-[#facc15]", border: "border-[#facc15]" },
    { key: Moods.TRISTE, label: "Triste", emoji: '😢', color: "text-[#256af4]", border: "border-[#256af4]" },
    { key: Moods.IRRITABLE, label: "Irritable", emoji: '😠', color: "text-[#ef4444]", border: "border-[#ef4444]" },
    { key: Moods.SENSIBLE, label: "Sensible", emoji: '🥺', color: "text-[#60a5fa]", border: "border-[#60a5fa]" },
    { key: Moods.ANSIOSA, label: "Ansiosa", emoji: '😰', color: "text-[#a855f7]", border: "border-[#a855f7]" }
  ];

  const symptomOptions = [
    { label: Symptoms.CÓLICOS, emoji: '💢' },
    { label: Symptoms.ACNÉ, emoji: '🔴' },
    { label: Symptoms.FATIGA, emoji: '😴' },
    { label: Symptoms.DOLOR_DE_CABEZA, emoji: '🤕' },
    { label: Symptoms.DOLOR_DE_ESPALDA, emoji: '😣' },
    { label: Symptoms.PECHOS_SENSIBLES, emoji: '💗' },
    { label: Symptoms.NÁUSEAS, emoji: '🤢' },
    { label: Symptoms.VÓMITO, emoji: '🤮' },
    { label: Symptoms.HINCHAZÓN, emoji: '🫄' },
    { label: Symptoms.ESTREÑIMIENTO, emoji: '😖' },
    { label: Symptoms.DIARREA, emoji: '💩' },
  ]

  const toggleSymptom = (symptom: Symptoms) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom.toString()) : [...prev, symptom.toString()]
    );
  };

  // // Check if flow indicates a period (any flow except empty)
  // const isPeriodFlow = (flowValue: Flow | undefined): boolean => {
  //   // Any flow value indicates a period (including light flow and spotting)
  //   return flowValue !== undefined && flowValue !== null;
  // };

  // // Check if this date is a new period start
  // const isNewPeriodStart = (date: Date, flowValue: Flow | undefined): boolean => {
  //   if (!data.lastPeriodStart || !isPeriodFlow(flowValue)) {
  //     return false;
  //   }

  //   const logDate = new Date(date);
  //   logDate.setHours(0, 0, 0, 0);

  //   const lastPeriod = new Date(data.lastPeriodStart);
  //   lastPeriod.setHours(0, 0, 0, 0);

  //   const periodLength = data.periodLength || 5;
  //   const periodEnd = new Date(lastPeriod);
  //   periodEnd.setDate(periodEnd.getDate() + periodLength);

  //   // If the log date is before the last period start, it's definitely a new period
  //   if (logDate < lastPeriod) {
  //     return true;
  //   }

  //   // If the log date is within the current period range, it's not a new period
  //   if (logDate >= lastPeriod && logDate <= periodEnd) {
  //     return false;
  //   }

  //   // If the log date is more than 2 days after the period end, it's likely a new period
  //   const daysAfterPeriodEnd = Math.floor((logDate.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24));
  //   return daysAfterPeriodEnd > 2;
  // };

  const handleSave = async () => {
    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) {
      alertError('Error', 'No se pudo identificar el usuario.');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      // Normal save (not a new period)
      await DailyLogsService.save({
        user_id: userId,
        date: dateStr,
        symptoms: symptoms,
        flow: flow || '',
        mood: moods.join(','),
        notes: notes,
      });

      alertSuccess('Guardado', 'Registro guardado correctamente.');
      router.back();
    } catch (error: any) {
      console.error('Save failed:', error);
      alertError('Error', error.message || 'No se pudo guardar el registro. Intenta más tarde.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1">
      <Stack.Screen options={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom'
      }} />
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
          <View className="h-26" />
          {/* Prediction */}
          <View className="flex-row items-center bg-primary/30 rounded-2xl p-4 gap-3 border border-primary/60 shadow-md">
            <MyIcon name="Sparkles" size={18} className="text-primary" />
            <Text className="text-base font-medium text-text-primary">
              Predicción: Posible inicio de periodo hoy.
            </Text>
          </View>

          {/* Menstruación */}
          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-text-primary">
                Menstruación
              </Text>
              <Text className="text-xs text-text-muted italic">
                (Opcional - solo si ya comenzó)
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-4 py-1" className="-mx-4 ">
              <View className="flex-row gap-3">
                {flowOptions.map(({ value, label, icon: IconName }) => {
                  const active = flow === value;
                  return (
                    <TouchableOpacity activeOpacity={0.6}
                      key={value}
                      onPress={() => setFlow(value)}
                      className={`w-20 h-24 shadow-md rounded-2xl items-center justify-center gap-2 border ${active
                        ? `bg-primary/10 border-primary`
                        : "border-gray-200 bg-background"
                        }`}
                    >
                      {flowIcons[value]}
                      <Text
                        className={`text-sm ${active
                          ? `font-bold text-primary`
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
            {!flow && (
              <Text className="text-xs text-text-muted mt-2 italic">
                Puedes registrar síntomas pre-menstruales sin seleccionar flujo
              </Text>
            )}
          </View>
          {/* Estado de ánimo */}
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3 text-text-primary">
              Estado de Ánimo
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-4 py-1" className="-mx-4 ">
              <View className="flex-row gap-3">
                {moodOptions.map(({ key, label, emoji, color, border }) => {
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
                      <Text style={{ fontSize: 28 }}>{emoji}</Text>
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
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-text-primary">
                Síntomas Físicos
              </Text>
              {!flow && (
                <View className="flex-row items-center gap-1">
                  <MyIcon name="Info" size={14} className="text-primary" />
                  <Text className="text-xs text-primary font-medium">
                    Pre-periodo
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row flex-wrap gap-2">
              {symptomOptions.map(({ label, emoji }) => (
                <TouchableOpacity activeOpacity={0.6}
                  onPress={() => toggleSymptom(label)}
                  key={label}
                  className={`flex-row items-center gap-2 px-4 py-3 rounded-full bg-background border border-gray-200 shadow-md ${symptoms.includes(label) ? "bg-primary border-primary" : "bg-background border-gray-200"}`}
                >
                  <Text style={{ fontSize: 16 }}>{emoji}</Text>
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
                placeholderTextColor={colors.textMuted}
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
