import { MyImage } from '@/components/ui';
import MyIcon from '@/components/ui/Icon';
import { useOnboarding } from '@/context/OnboardingContext';
import { getCycleDay, getCyclePhase, getFertileWindow, getNextPeriodDate } from '@/utils/predictions';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/utils/colors';

function buildMarkedDates() {
  return {
    // Period (4–8)
    "2023-10-04": { startingDay: true, color: colors.period },
    "2023-10-05": { color: colors.period },
    "2023-10-06": { color: colors.period },
    "2023-10-07": { color: colors.period },
    "2023-10-08": { endingDay: true, color: colors.period },

    // Fertile window
    "2023-10-13": { marked: true, dotColor: colors.fertile },
    "2023-10-14": { marked: true, dotColor: colors.fertile },
    "2023-10-16": { marked: true, dotColor: colors.fertile },

    // Ovulation
    "2023-10-15": {
      customStyles: {
        container: {
          borderWidth: 2,
          borderColor: colors.ovulation,
          backgroundColor: "#f5f3ff",
        },
        text: {
          color: colors.ovulation,
          fontWeight: "700",
        },
      },
    },

    // Today
    "2023-10-17": {
      selected: true,
      selectedColor: colors.lavender,
    },
  }
}

function LegendDot({ color, label }: any) {
  return (
    <View className="items-center gap-1">
      <View
        style={{ backgroundColor: color, width: 12, height: 12, borderRadius: 12 }}
      />
      <Text className="text-base text-text-muted">{label}</Text>
    </View>
  )
}

function LegendRing({ color, label }: any) {
  return (
    <View className="items-center gap-1">
      <View className="size-3 rounded-full border-2 border-primary" />
      <Text className="text-base text-text-muted">{label}</Text>
    </View>
  )
}


export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isComplete } = useOnboarding();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Redirect to onboarding if not complete
  useEffect(() => {
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const isPeriodDay = (date: Date) => {
    // Check if date is within current period
    const periodStart = new Date(data.lastPeriodStart);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + (data.periodLength || 5));

    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);

    if (dateNormalized >= periodStart && dateNormalized <= periodEnd) {
      return true;
    }

    // Check if date is within next period
    const nextPeriodStart = new Date(nextPeriodResult.date);
    nextPeriodStart.setHours(0, 0, 0, 0);
    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + (data.periodLength || 5));

    if (dateNormalized >= nextPeriodStart && dateNormalized <= nextPeriodEnd) {
      return true;
    }

    return false;
  };

  const isFertileDay = (date: Date) => {
    if (!fertileWindow || data.cycleType !== 'regular') return false;

    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);

    // Calculate fertile window dates based on cycle day
    const lastPeriod = new Date(data.lastPeriodStart);
    lastPeriod.setHours(0, 0, 0, 0);

    const fertileStart = new Date(lastPeriod);
    fertileStart.setDate(fertileStart.getDate() + fertileWindow.startDay);

    const fertileEnd = new Date(lastPeriod);
    fertileEnd.setDate(fertileEnd.getDate() + fertileWindow.endDay);

    return dateNormalized >= fertileStart && dateNormalized <= fertileEnd;
  };

  const isOvulationDay = (date: Date) => {
    if (!ovulationDate) return false;
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);
    const ovNormalized = new Date(ovulationDate);
    ovNormalized.setHours(0, 0, 0, 0);
    return dateNormalized.getTime() === ovNormalized.getTime();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const days = getDaysInMonth(currentMonth);
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

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

  // Calculate days until next period
  const daysUntilNext = Math.ceil(
    (nextPeriodResult.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const markedDates = useMemo(buildMarkedDates, [])

  return (
    <View className="flex-1 bg-background relative">
      <View
        className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm"
      >
        <View />
        <Pressable className="size-10 items-center justify-center rounded-full hidden">
          <MyIcon name="ChevronLeft" size={22} className="text-text-primary" />
        </Pressable>

        <Text className="text-lg font-bold text-text-primary">
          {monthName} {year}
        </Text>

        <Pressable className="px-3 py-1.5 rounded-full bg-primary/10">
          <Text className="text-primary font-bold text-sm">Hoy</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-20 " />


        {/* ───── Calendar ───── */}
        <View className="pt-2">
          <Calendar
            current={currentMonth.toISOString().split('T')[0]}
            markingType="period"
            markedDates={markedDates as any}
            enableSwipeMonths
            dayComponent={({ date, state }) => {
              const isToday = date?.dateString === today.toDateString()

              return (
                <View className="items-center justify-center h-11">
                  <View
                    className={`size-9 items-center justify-center rounded-full ${isToday ? "bg-primary" : ""
                      }`}
                  >
                    <Text
                      className={`text-sm ${isToday
                        ? "text-white font-bold"
                        : "text-text-primary"
                        }`}
                    >
                      {date?.day}
                    </Text>
                  </View>
                  {isToday && (
                    <Text className="text-[10px] text-primary font-bold mt-0.5">
                      Hoy
                    </Text>
                  )}
                </View>
              )
            }}
            theme={{
              // use colors
              calendarBackground: "transparent",
              monthTextColor: "text-text-primary",
              textSectionTitleColor: "text-text-muted",
              dayTextColor: "text-text-primary",
              todayTextColor: "text-primary",
              arrowColor: "text-primary",
              textMonthFontWeight: "700",
            }}
          />
        </View>

        {/* ───── Legend ───── */}
        <View className="p-5 pt-6 rounded-[32px]  flex-row justify-around  bg-white border border-gray-100 shadow-md">
          <LegendDot key={colors.period} color={colors.period} label="Periodo" />
          <LegendDot key={colors.fertile} color={colors.fertile} label="Fértil" />
          <LegendRing color={colors.ovulation} label="Ovulación" />
        </View>

        {/* ───── Status Card ───── */}
        <View className="pt-2">
          <View className="flex-row gap-4 rounded-xl bg-white  p-5 border border-gray-100 shadow-md">
            <View className="flex-1 gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-[11px] font-bold uppercase text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                  Fase Lútea
                </Text>
              </View>
              <Text className="text-lg font-bold text-text-primary">
                Día 17 del ciclo
              </Text>
              <Text className="text-base text-text-muted">
                Probabilidad baja de embarazo. Tu próximo periodo se espera
                en 11 días.
              </Text>
            </View>

            <MyImage
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuB39TL-FgtOjPCzNKS56wzfQQnWiH_sdoFfT2uoUWcQGR2Xat7reUAsX0mJ9fGS0nIIDtqnTbmSxWaUu-4GXsJrUUYikiE0xkeNMHs3tpTLFjp6S_EWB_vkPSKYxmqAV33ApRQ_vPlivaGB9SjmNWyYagSXO03_g_0SvqAMFWeduRJxvQEXAuJ7AMrhuPj10k1sQYQBTThrs1QLw61Iain14BPMAOmhTpbKb7CDqKxiKh_X9LktDFoPdJMMraAgtgc4lxkgRmyTY_Q",
              }}
              className="w-24  rounded-xl object-cover"
            />
          </View>
        </View>

        {/* ───── FAB ───── */}
        <View className="py-4">
          <Pressable className="py-5 rounded-full bg-primary items-center justify-center flex-row shadow-lg">
            <MyIcon name="Droplet" size={20} className="text-white fill-white" />
            <Text className="ml-2 text-white font-bold">
              Registrar Periodo
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

