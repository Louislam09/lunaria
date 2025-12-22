import { MyImage } from '@/components/ui';
import MyIcon from '@/components/ui/Icon';
import { useOnboarding } from '@/context/OnboardingContext';
import { getCycleDay, getCyclePhase, getFertileWindow, getNextPeriodDate } from '@/utils/predictions';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, CalendarUtils, LocaleConfig } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/utils/colors';
import { styled } from 'nativewind';
import { Theme } from 'react-native-calendars/src/types';
import { fontFamily } from '@/utils/typography';

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: 'Hoy'
};

LocaleConfig.defaultLocale = 'es';

export function getTheme(): Theme {
  return {

    // all colors properties
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: colors.textPrimary,
    dayTextColor: colors.textPrimary,
    selectedDayBackgroundColor: colors.lavender,
    selectedDayTextColor: colors.textPrimary,
    textDisabledColor: colors.textMuted,
    arrowColor: colors.textPrimary,

    // today
    todayTextColor: '#ffffff',
    todayBackgroundColor: colors.lavender,
    // arrows
    arrowStyle: { padding: 0 },
    // knob
    // expandableKnobColor: colors.lavender,
    // month
    monthTextColor: colors.textPrimary,
    textMonthFontSize: 16,
    // textMonthFontFamily: 'DMSans_700Bold',
    textMonthFontWeight: 'bold' as const,
    // day names
    textDayHeaderFontSize: 12,
    // textDayHeaderFontFamily: 'DMSans_400Regular',
    textDayHeaderFontWeight: 'normal' as const,
    // dates

    textDayFontSize: 18,

    // dot (marked date)
    // dotColor: colors.lavender,
    // selectedDotColor: colors.lavender,
    // disabledDotColor: colors.textMuted,

  };
}

const MyCalendar = styled(Calendar, {
  className: "style",
})


// const getDate = (count) => {
//   const date = new Date('2025-12-03');
//   const newDate = date.setDate(date.getDate() + count);
//   return CalendarUtils.getCalendarDateString(newDate);
// };

// const GREEN = '#13ba7d';
// const PINK = '#a68a9f';
// const RED = '#ba1313';

// const customMarks = useMemo(() => {
//   return {
//     [getDate(0)]: {
//       customStyles: {
//         container: {
//           backgroundColor: 'white',
//           elevation: 2
//         },
//         text: {
//           color: RED,
//           marginTop: 0
//         }
//       }
//     },
//     [getDate(1)]: {
//       selected: true
//     },
//     [getDate(2)]: {
//       customStyles: {
//         container: {
//           backgroundColor: RED,
//           elevation: 4
//         },
//         text: {
//           color: 'white'
//         }
//       }
//     },
//     [getDate(3)]: {
//       customStyles: {
//         container: {
//           backgroundColor: GREEN
//         },
//         text: {
//           color: 'white'
//         }
//       }
//     },
//     [getDate(4)]: {
//       customStyles: {
//         container: {
//           backgroundColor: 'black',
//           elevation: 2
//         },
//         text: {
//           color: 'yellow'
//         }
//       }
//     },
//     [getDate(5)]: {
//       disabled: true
//     },
//     [getDate(6)]: {
//       customStyles: {
//         text: {
//           color: 'black',
//           fontWeight: 'bold'
//         }
//       }
//     },
//     [getDate(7)]: {
//       customStyles: {
//         container: {
//           backgroundColor: 'pink',
//           elevation: 4,
//           borderColor: 'purple',
//           borderWidth: 5
//         },
//         text: {
//           marginTop: 3,
//           fontSize: 11,
//           color: 'black'
//         }
//       }
//     },
//     [getDate(8)]: {
//       customStyles: {
//         container: {
//           backgroundColor: 'orange',
//           borderRadius: 0
//         }
//       }
//     }
//   };
// }, []);

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

    const ensureCustom = (dateStr: string) => {
      if (!marked[dateStr]) marked[dateStr] = {};
      if (!marked[dateStr].customStyles) {
        marked[dateStr].customStyles = { container: {}, text: {} };
      }
    };

    // 1. Current Period
    const start = new Date(data.lastPeriodStart);
    for (let i = 0; i < periodLen; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isFirst = i === 0;
      const isLast = i === periodLen - 1;

      ensureCustom(dateStr);
      marked[dateStr].customStyles = {
        container: {
          backgroundColor: colors.period + '33', // Light fill like the image
          borderTopLeftRadius: isFirst ? 20 : 0,
          borderBottomLeftRadius: isFirst ? 20 : 0,
          borderTopRightRadius: isLast ? 20 : 0,
          borderBottomRightRadius: isLast ? 20 : 0,
          width: '100%',
          height: 32,
          justifyContent: 'center',
          alignItems: 'center',
          // If it's an edge day, maybe add a subtle border or solid color? 
          // The image shows a very clean uniform pill.
        },
        text: {
          color: colors.textPrimary,
          fontWeight: '500',
        },
      };
    }

    // 2. Next Period Prediction
    const nextStart = new Date(cycleData.nextPeriodResult.date);
    for (let i = 0; i < periodLen; i++) {
      const d = new Date(nextStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isFirst = i === 0;
      const isLast = i === periodLen - 1;

      if (!marked[dateStr]) {
        ensureCustom(dateStr);
        marked[dateStr].customStyles = {
          container: {
            backgroundColor: colors.period + '15', // Even lighter for prediction
            borderTopLeftRadius: isFirst ? 20 : 0,
            borderBottomLeftRadius: isFirst ? 20 : 0,
            borderTopRightRadius: isLast ? 20 : 0,
            borderBottomRightRadius: isLast ? 20 : 0,
            width: '100%',
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
          },
          text: {
            color: colors.textPrimary,
            opacity: 0.7,
          },
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

        ensureCustom(dateStr);
        if (!marked[dateStr].customStyles.container.backgroundColor) {
          marked[dateStr].customStyles.container = {
            ...marked[dateStr].customStyles.container,
            borderWidth: 2,
            borderColor: colors.fertile,
            borderRadius: 20,
          };
          marked[dateStr].customStyles.text = {
            ...marked[dateStr].customStyles.text,
            color: colors.textPrimary,
          };
        } else {
          // If already in period, use a contrasting marker or dot
          marked[dateStr].marked = true;
          marked[dateStr].dotColor = 'white';
        }
      }
    }

    // 4. Ovulation
    if (cycleData.ovulationDate) {
      const dateStr = cycleData.ovulationDate.toISOString().split('T')[0];
      ensureCustom(dateStr);
      marked[dateStr].customStyles.container = {
        ...marked[dateStr].customStyles.container,
        borderWidth: 2,
        borderColor: colors.ovulation,
        borderRadius: 20,
        backgroundColor: marked[dateStr].customStyles.container.backgroundColor || colors.ovulation + '20',
      };
      marked[dateStr].customStyles.text = {
        ...marked[dateStr].customStyles.text,
        color: marked[dateStr].customStyles.text.color || colors.ovulation,
        fontWeight: 'bold',
      };
    }

    // 5. Selected Day
    if (selected) {
      ensureCustom(selected);
      marked[selected].customStyles = {
        ...marked[selected].customStyles,
        container: {
          ...marked[selected].customStyles.container,
          backgroundColor: colors.lavender,
          borderRadius: 20,
          elevation: 4,
        },
        text: {
          ...marked[selected].customStyles.text,
          color: 'white',
          fontWeight: 'bold',
        },
      };
    }

    return marked;
  }, [cycleData, data, selected]);

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

  const phaseDisplay = getPhaseDisplay(cycleData?.phase);
  // console.log(markedDates)




  if (isLoading || !isComplete || !cycleData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

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
          <MyCalendar
            current={currentMonth.toISOString().split('T')[0]}
            markingType='custom'
            markedDates={markedDates as any}
            onMonthChange={(month) => {
              setCurrentMonth(new Date(month.timestamp))
            }}
            onDayPress={onDayPress}
            enableSwipeMonths
            theme={getTheme() as any}
          // theme={{
          //   backgroundColor: '#000000',
          //   calendarBackground: '#000000',
          //   textSectionTitleColor: '#ffffff',
          //   selectedDayBackgroundColor: '#73ff00',
          //   selectedDayTextColor: '#ff00b3',
          //   todayTextColor: '#f51d00',
          //   dayTextColor: "orange",
          //   textDisabledColor: colors.textMuted
          // }}
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
      <View style={{ borderColor: color, borderWidth: 2 }} className="size-3 rounded-full" />
      <Text className="text-xs text-text-muted">{label}</Text>
    </View>
  )
}
