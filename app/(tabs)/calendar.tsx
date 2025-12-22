import { MyImage } from '@/components/ui';
import MyIcon from '@/components/ui/Icon';
import { useOnboarding } from '@/context/OnboardingContext';
import { getCycleDay, getCyclePhase, getFertileWindow, getNextPeriodDate } from '@/utils/predictions';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, CalendarUtils } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/utils/colors';


function LegendDot({ color, label }: any) {
  return (
    <View className="items-center gap-1">
      <View
        style={{ backgroundColor: color, width: 12, height: 12, borderRadius: 12 }}
      />
      <Text className="text-xs text-text-muted">{label}</Text>
    </View>
  )
}

function LegendRing({ color, label }: any) {
  return (
    <View className="items-center gap-1">
      <View className="size-3 rounded-full border-2 border-ovulation" />
      <Text className="text-xs text-text-muted">{label}</Text>
    </View>
  )
}


export function getTheme() {
  const disabledColor = 'grey';

  return {
    // arrows
    arrowColor: colors.textPrimary,
    arrowStyle: { padding: 0 },
    // knob
    expandableKnobColor: colors.lavender,
    // month
    monthTextColor: colors.textPrimary,
    textMonthFontSize: 16,
    // textMonthFontFamily: 'DMSans_700Bold',
    textMonthFontWeight: 'bold' as const,
    // day names
    textSectionTitleColor: colors.textPrimary,
    textDayHeaderFontSize: 12,
    // textDayHeaderFontFamily: 'DMSans_400Regular',
    textDayHeaderFontWeight: 'normal' as const,
    // dates
    dayTextColor: colors.textPrimary,
    todayTextColor: colors.lavender,
    textDayFontSize: 18,
    // textDayFontFamily: 'DMSans_700Bold',
    textDayFontWeight: 'bold' as const,
    textDayStyle: { marginTop: Platform.OS === 'android' ? 2 : 4 },
    // selected date
    selectedDayBackgroundColor: colors.lavender,
    selectedDayTextColor: 'white',
    // disabled date
    textDisabledColor: disabledColor,
    // dot (marked date)
    dotColor: colors.lavender,
    selectedDotColor: colors.lavender,
    disabledDotColor: colors.textMuted,
    dotStyle: { marginTop: -2 }
  };
}


export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isComplete } = useOnboarding();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState(CalendarUtils.getCalendarDateString(new Date()));

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const onDayPress = useCallback((day: any) => {
    setSelected(day.dateString);
  }, []);

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!isLoading && !isComplete) {
      router.replace('/onboarding/wizard');
    }
  }, [isLoading, isComplete]);

  // Calculations
  const cycleData = useMemo(() => {
    if (!data.lastPeriodStart || !data.cycleType || !data.periodLength) return null;

    const predictionInput = {
      lastPeriodStart: new Date(data.lastPeriodStart),
      cycleType: data.cycleType as 'regular' | 'irregular',
      averageCycleLength: data.averageCycleLength,
      cycleRangeMin: data.cycleRangeMin,
      cycleRangeMax: data.cycleRangeMax,
      periodLength: data.periodLength,
    };

    const nextPeriodResult = getNextPeriodDate(predictionInput);
    const cycleDay = getCycleDay(new Date(data.lastPeriodStart), today);

    const cycleLength = data.cycleType === 'regular' && data.averageCycleLength
      ? data.averageCycleLength
      : data.cycleRangeMin && data.cycleRangeMax
        ? Math.round((data.cycleRangeMin + data.cycleRangeMax) / 2)
        : 28;

    const phase = getCyclePhase(cycleDay, cycleLength);

    const fertileWindow = data.cycleType === 'regular' && data.averageCycleLength
      ? getFertileWindow(data.averageCycleLength)
      : null;

    const ovulationDate = data.cycleType === 'regular' && data.averageCycleLength
      ? (() => {
        const ov = new Date(nextPeriodResult.date);
        ov.setDate(ov.getDate() - 14);
        return ov;
      })()
      : null;

    const daysUntilNext = Math.ceil(
      (nextPeriodResult.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      nextPeriodResult,
      cycleDay,
      cycleLength,
      phase,
      fertileWindow,
      ovulationDate,
      daysUntilNext
    };
  }, [data, today]);

  const markedDates = useMemo(() => {
    if (!cycleData || !data.lastPeriodStart) return {};

    const marked: any = {};
    const periodLen = data.periodLength || 5;

    // 1. Current Period
    const start = new Date(data.lastPeriodStart);
    for (let i = 0; i < periodLen; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      marked[dateStr] = {
        color: colors.period,
        textColor: 'white',
        startingDay: i === 0,
        endingDay: i === periodLen - 1,
      };
    }

    // 2. Next Period Prediction
    const nextStart = new Date(cycleData.nextPeriodResult.date);
    for (let i = 0; i < periodLen; i++) {
      const d = new Date(nextStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (!marked[dateStr]) {
        marked[dateStr] = {
          color: colors.period + '40', // Semi-transparent
          textColor: colors.textPrimary,
          startingDay: i === 0,
          endingDay: i === periodLen - 1,
        };
      }
    }

    // 3. Fertile Window
    if (cycleData.fertileWindow) {
      const lastPeriod = new Date(data.lastPeriodStart);
      for (let i = cycleData.fertileWindow.startDay; i <= cycleData.fertileWindow.endDay; i++) {
        const d = new Date(lastPeriod);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];

        if (!marked[dateStr]) {
          marked[dateStr] = { marked: true, dotColor: colors.fertile };
        } else {
          marked[dateStr].marked = true;
          // If it's already a period day, use white dot for visibility like in the user's example
          marked[dateStr].dotColor = marked[dateStr].color ? 'white' : colors.fertile;
        }
      }
    }

    // 4. Ovulation
    if (cycleData.ovulationDate) {
      const dateStr = cycleData.ovulationDate.toISOString().split('T')[0];
      if (!marked[dateStr]) {
        marked[dateStr] = { marked: true, dotColor: colors.ovulation };
      } else {
        marked[dateStr].marked = true;
        marked[dateStr].dotColor = 'white';
      }
    }

    // 5. Selected Day
    if (selected) {
      if (!marked[selected]) {
        marked[selected] = { selected: true, selectedColor: colors.lavender };
      } else {
        marked[selected].selected = true;
        marked[selected].selectedColor = colors.lavender;
      }
    }

    return marked;
  }, [cycleData, data, selected]);

  if (isLoading || !isComplete || !cycleData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  const getPhaseDisplay = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return {
          name: 'Menstruación',
          color: 'text-rose-600',
          bgColor: 'bg-rose-500/10',
          chance: 'Probabilidad muy baja de embarazo.',
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB39TL-FgtOjPCzNKS56wzfQQnWiH_sdoFfT2uoUWcQGR2Xat7reUAsX0mJ9fGS0nIIDtqnTbmSxWaUu-4GXsJrUUYikiE0xkeNMHs3tpTLFjp6S_EWB_vkPSKYxmqAV33ApRQ_vPlivaGB9SjmNWyYagSXO03_g_0SvqAMFWeduRJxvQEXAuJ7AMrhuPj10k1sQYQBTThrs1QLw61Iain14BPMAOmhTpbKb7CDqKxiKh_X9LktDFoPdJMMraAgtgc4lxkgRmyTY_Q"
        };
      case 'follicular':
        return {
          name: 'Fase Folicular',
          color: 'text-blue-600',
          bgColor: 'bg-blue-500/10',
          chance: 'Probabilidad baja de embarazo.',
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB39TL-FgtOjPCzNKS56wzfQQnWiH_sdoFfT2uoUWcQGR2Xat7reUAsX0mJ9fGS0nIIDtqnTbmSxWaUu-4GXsJrUUYikiE0xkeNMHs3tpTLFjp6S_EWB_vkPSKYxmqAV33ApRQ_vPlivaGB9SjmNWyYagSXO03_g_0SvqAMFWeduRJxvQEXAuJ7AMrhuPj10k1sQYQBTThrs1QLw61Iain14BPMAOmhTpbKb7CDqKxiKh_X9LktDFoPdJMMraAgtgc4lxkgRmyTY_Q"
        };
      case 'ovulatory':
        return {
          name: 'Ovulación',
          color: 'text-purple-600',
          bgColor: 'bg-purple-500/10',
          chance: 'Probabilidad alta de embarazo.',
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB39TL-FgtOjPCzNKS56wzfQQnWiH_sdoFfT2uoUWcQGR2Xat7reUAsX0mJ9fGS0nIIDtqnTbmSxWaUu-4GXsJrUUYikiE0xkeNMHs3tpTLFjp6S_EWB_vkPSKYxmqAV33ApRQ_vPlivaGB9SjmNWyYagSXO03_g_0SvqAMFWeduRJxvQEXAuJ7AMrhuPj10k1sQYQBTThrs1QLw61Iain14BPMAOmhTpbKb7CDqKxiKh_X9LktDFoPdJMMraAgtgc4lxkgRmyTY_Q"
        };
      case 'luteal':
      default:
        return {
          name: 'Fase Lútea',
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
          chance: 'Probabilidad baja de embarazo.',
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB39TL-FgtOjPCzNKS56wzfQQnWiH_sdoFfT2uoUWcQGR2Xat7reUAsX0mJ9fGS0nIIDtqnTbmSxWaUu-4GXsJrUUYikiE0xkeNMHs3tpTLFjp6S_EWB_vkPSKYxmqAV33ApRQ_vPlivaGB9SjmNWyYagSXO03_g_0SvqAMFWeduRJxvQEXAuJ7AMrhuPj10k1sQYQBTThrs1QLw61Iain14BPMAOmhTpbKb7CDqKxiKh_X9LktDFoPdJMMraAgtgc4lxkgRmyTY_Q"
        };
    }
  };

  const phaseDisplay = getPhaseDisplay(cycleData.phase);
  // console.log(markedDates)

  return (
    <View className="flex-1 bg-background relative">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
        <Text className="text-2xl font-bold text-text-primary">
          Calendario
          {/* {monthName} {year} */}
        </Text>

        <TouchableOpacity
          onPress={() => {
            const now = new Date();
            setCurrentMonth(now);
            setSelected(CalendarUtils.getCalendarDateString(now));
          }}
          className="h-10 w-10 items-center justify-center rounded-full bg-background"
        >
          <MyIcon name="Calendar" className="text-text-primary" />
          {/* <Text className="text-text-primary font-bold text-sm">Hoy</Text> */}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-24" />

        {/* ───── Calendar ───── */}
        <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-50">
          <Calendar
            current={currentMonth.toISOString().split('T')[0]}
            markingType={'period'}
            markedDates={markedDates}
            onMonthChange={(month) => {
              setCurrentMonth(new Date(month.timestamp))
            }}
            onDayPress={onDayPress}
            enableSwipeMonths
          // theme={getTheme()}
          />
        </View>

        {/* ───── Legend ───── */}
        <View className="mt-6 p-4 rounded-3xl flex-row justify-around items-center bg-white border border-gray-100 shadow-sm">
          <LegendDot color={colors.period} label="Periodo" />
          <LegendDot color={colors.fertile} label="Fértil" />
          <LegendRing color={colors.ovulation} label="Ovulación" />
        </View>

        {/* ───── Status Card ───── */}
        <View className="mt-4">
          <View className="flex-row gap-4 rounded-3xl bg-white p-5 border border-gray-100 shadow-sm">
            <View className="flex-1 gap-2">
              <View className="flex-row items-center">
                <Text className={`text-[10px] font-bold uppercase ${phaseDisplay.color} ${phaseDisplay.bgColor} px-2.5 py-1 rounded-full`}>
                  {phaseDisplay.name}
                </Text>
              </View>
              <Text className="text-xl font-bold text-text-primary">
                Día {cycleData.cycleDay} del ciclo
              </Text>
              <Text className="text-sm text-text-muted leading-5">
                {phaseDisplay.chance} Tu próximo periodo se espera en <Text className="font-bold text-text-primary">{cycleData.daysUntilNext} días</Text>.
              </Text>
            </View>

            <MyImage
              source={{ uri: phaseDisplay.image }}
              className="w-20 h-20 rounded-2xl"
            />
          </View>
        </View>

        {/* ───── FAB ───── */}
        <View className="mt-6 mb-10">
          <Pressable className="py-4 rounded-2xl bg-primary items-center justify-center flex-row shadow-lg active:opacity-90">
            <MyIcon name="Droplet" size={20} className="text-white" />
            <Text className="ml-2 text-white font-bold text-lg">
              Registrar Periodo
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
