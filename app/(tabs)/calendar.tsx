import { MyImage } from '@/components/ui';
import MyIcon from '@/components/ui/Icon';
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCyclePredictions } from '@/hooks/useCyclePredictions';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { CyclesService } from '@/services/dataService';
import { getActivePeriod, getPeriodFromLogs, ActivePeriod } from '@/utils/periodDetection';
import { getCycleDay } from '@/utils/predictions';
import { formatDate } from '@/utils/dates';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDailyLogs } from '@/hooks/useReactiveData';
import { usePeriodButtons } from '@/hooks/usePeriodButtons';
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
    backgroundColor: colors.moonWhite,
    calendarBackground: colors.moonWhite,
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
    textMonthFontSize: 20,
    textMonthFontFamily: fontFamily.bold,
    textMonthFontWeight: 'bold' as const,
    // day names
    textDayHeaderFontSize: 12,
    // textDayHeaderFontFamily: 'DMSans_400Regular',
    textDayHeaderFontWeight: 'normal' as const,
    // dates

    textDayFontSize: 18,
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

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isComplete, updateData } = useOnboarding();
  const { user, isAuthenticated, localUserId } = useAuth();
  const { alertSuccess, alertError, confirm } = useAlert();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState(CalendarUtils.getCalendarDateString(new Date()));
  const [activePeriod, setActivePeriod] = useState<ActivePeriod | null>(null);
  const [isMarkingEnd, setIsMarkingEnd] = useState(false);
  const [actualPeriod, setActualPeriod] = useState<{ startDate: string; endDate: string } | null>(null);
  const [suggestedPeriodEnd, setSuggestedPeriodEnd] = useState<{ date: string; showDialog: boolean } | null>(null);
  const lastSuggestedDateRef = React.useRef<string | null>(null);

  const userId = isAuthenticated && user ? user.id : localUserId;

  // Get daily logs reactively
  const dailyLogs = useDailyLogs(userId || '');

  // Detect actual period from flow data
  useEffect(() => {
    const detectActualPeriod = async () => {
      if (!userId || !data.lastPeriodStart) return;

      try {
        const period = await getPeriodFromLogs(userId, new Date(data.lastPeriodStart));
        if (period) {
          setActualPeriod({
            startDate: period.startDate,
            endDate: period.endDate,
          });
        } else {
          setActualPeriod(null);
        }
      } catch (error) {
        console.error('Error detecting actual period:', error);
        setActualPeriod(null);
      }
    };

    detectActualPeriod();
  }, [userId, data.lastPeriodStart, dailyLogs]);

  // Suggest period end when detected (require confirmation)
  useEffect(() => {
    const checkPeriodEnd = async () => {
      if (!userId || !data.lastPeriodStart || data.lastPeriodEnd) {
        // Reset suggestion if period has ended
        if (suggestedPeriodEnd) {
          setSuggestedPeriodEnd(null);
        }
        return;
      }

      try {
        const period = await getPeriodFromLogs(userId, new Date(data.lastPeriodStart));

        // If period is complete (2+ days without flow) and not yet marked as ended
        if (period && period.isComplete && period.suggestedEndDate) {
          // Only suggest if we haven't shown this suggestion yet for this date
          if (lastSuggestedDateRef.current !== period.suggestedEndDate) {
            lastSuggestedDateRef.current = period.suggestedEndDate;
            const endDate = new Date(period.suggestedEndDate);
            const endDateFormatted = formatDate(endDate, 'long');

            // Show confirmation dialog
            confirm(
              '¿Tu periodo terminó?',
              `Tu periodo parece haber terminado el ${endDateFormatted}. ¿Marcar como finalizado?`,
              async () => {
                // User confirmed - mark period as ended
                await handleMarkPeriodEnd(endDate);
                setSuggestedPeriodEnd(null);
                lastSuggestedDateRef.current = null;
              },
              () => {
                // User cancelled - dismiss suggestion
                setSuggestedPeriodEnd(null);
                // Don't reset ref so we don't show again for same date
              }
            );

            setSuggestedPeriodEnd({
              date: period.suggestedEndDate,
              showDialog: false, // Dialog already shown
            });
          }
        } else {
          // Reset suggestion if period is no longer complete
          if (suggestedPeriodEnd) {
            setSuggestedPeriodEnd(null);
          }
          // Reset ref if period is not complete
          if (period && !period.isComplete) {
            lastSuggestedDateRef.current = null;
          }
        }
      } catch (error) {
        console.error('Error checking period end:', error);
      }
    };

    checkPeriodEnd();
  }, [userId, data.lastPeriodStart, data.lastPeriodEnd, dailyLogs]);

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

  // Load active period detection
  useEffect(() => {
    const loadActivePeriod = async () => {
      if (!data.lastPeriodStart || !isComplete) return;

      const userId = isAuthenticated && user ? user.id : localUserId;
      if (!userId) return;

      try {
        const period = await getActivePeriod(userId, new Date(data.lastPeriodStart));
        setActivePeriod(period);
      } catch (error) {
        console.error('Error loading active period:', error);
        setActivePeriod(null);
      }
    };

    loadActivePeriod();
  }, [data.lastPeriodStart, isComplete, isAuthenticated, user, localUserId]);

  // Handle marking period end
  const handleMarkPeriodEnd = useCallback(async (endDate?: Date) => {
    if (isMarkingEnd) return;

    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) {
      alertError('Error', 'No se pudo identificar el usuario.');
      return;
    }

    // Show confirmation dialog
    confirm(
      'Marcar fin del periodo',
      '¿Estás segura de que quieres marcar el fin de tu periodo? Esta acción actualizará tu ciclo.',
      async () => {
        setIsMarkingEnd(true);
        try {
          // Use provided end date, or today's date, or detect from flow data
          let endDateToUse: Date;

          if (endDate) {
            endDateToUse = endDate;
          } else {
            // Try to detect from flow data
            const period = await getPeriodFromLogs(userId, new Date(data.lastPeriodStart || new Date()));
            if (period && period.suggestedEndDate) {
              endDateToUse = new Date(period.suggestedEndDate);
            } else {
              endDateToUse = new Date();
            }
          }

          endDateToUse.setHours(0, 0, 0, 0);
          const endDateStr = endDateToUse.toISOString().split('T')[0];
          const startDate = activePeriod?.startDate || data.lastPeriodStart?.toISOString().split('T')[0];

          if (!startDate) {
            throw new Error('No se pudo determinar la fecha de inicio del periodo.');
          }

          await CyclesService.markPeriodEnd(userId, endDateStr, startDate);

          // Calculate actual period length
          const startDateObj = new Date(startDate);
          startDateObj.setHours(0, 0, 0, 0);
          const actualLength = Math.floor((endDateToUse.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          // Update lastPeriodEnd in user profile
          await updateData({ lastPeriodEnd: endDateToUse });

          // Adapt periodLength if actual differs significantly (2+ days)
          let message = 'Se ha marcado el fin de tu periodo. El ciclo se ha actualizado correctamente.';
          if (data.periodLength && Math.abs(actualLength - data.periodLength) >= 2) {
            await updateData({ periodLength: actualLength });
            message = `Periodo finalizado. La duración del periodo se ha actualizado a ${actualLength} días basado en tus datos reales.`;
          }

          alertSuccess('Periodo finalizado', message);

          // Reload active period to update UI
          const period = await getActivePeriod(userId, new Date(data.lastPeriodStart || new Date()));
          setActivePeriod(period);
        } catch (error: any) {
          console.error('Error marking period end:', error);
          alertError('Error', error.message || 'No se pudo marcar el fin del periodo. Intenta más tarde.');
        } finally {
          setIsMarkingEnd(false);
        }
      }
    );
  }, [isMarkingEnd, isAuthenticated, user, localUserId, data.lastPeriodStart, data.periodLength, activePeriod, updateData, alertSuccess, alertError, confirm]);

  // Get cycle predictions from hook
  const cyclePredictions = useCyclePredictions(data);

  // Get period buttons using custom hook
  const periodButtons = usePeriodButtons({
    data,
    actualPeriod,
    dailyLogs,
    isMarkingEnd,
    onMarkPeriodEnd: () => handleMarkPeriodEnd(),
  });

  // Calculations
  const cycleData = useMemo(() => {
    if (!data.lastPeriodStart || !data.cycleType || !data.periodLength) return null;

    const cycleDay = getCycleDay(new Date(data.lastPeriodStart), today, data.lastPeriodEnd);

    const ovulationDate = data.cycleType === 'regular' && data.averageCycleLength
      ? (() => {
        const ov = new Date(cyclePredictions.nextPeriodResult.date);
        ov.setDate(ov.getDate() - 14);
        return ov;
      })()
      : null;

    const daysUntilNext = cyclePredictions.daysUntilPeriod;

    return {
      nextPeriodResult: cyclePredictions.nextPeriodResult,
      cycleDay,
      cycleLength: cyclePredictions.cycleLength,
      phase: cyclePredictions.phase,
      fertileWindow: cyclePredictions.fertileWindow,
      ovulationDate,
      daysUntilNext
    };
  }, [data, today, cyclePredictions]);

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

    // Helper function to check if flow indicates period
    const isValidPeriodFlow = (flow: string | null | undefined): boolean => {
      if (!flow) return false;
      const flowLower = flow.toLowerCase();
      return flowLower === 'leve' ||
        flowLower === 'medio' ||
        flowLower === 'alto' ||
        flowLower === 'mancha' ||
        flowLower === 'abundante';
    };

    // Priority 1: Show actual logged period from flow data
    if (actualPeriod) {
      const startDate = new Date(actualPeriod.startDate);
      const endDate = new Date(actualPeriod.endDate);

      // Get all dates with flow between start and end
      const periodDaysWithFlow: string[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const log = dailyLogs.find(l => l.date === dateStr);

        if (log && isValidPeriodFlow(log.flow)) {
          periodDaysWithFlow.push(dateStr);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Mark all days with actual flow data
      periodDaysWithFlow.forEach((dateStr, index) => {
        const isFirst = index === 0;
        const isLast = index === periodDaysWithFlow.length - 1;

        if (isFirst) {
          marked[dateStr] = {
            startingDay: true,
            color: colors.period + "66",
            textColor: 'white',
            selected: true,
          };
          marked[dateStr].customContainerStyle = {
            ...marked[dateStr].customContainerStyle,
            backgroundColor: colors.period,
            borderRadius: 18,
            elevation: 4,
          };
        } else if (isLast) {
          marked[dateStr] = {
            endingDay: true,
            color: colors.period + "66",
            textColor: 'white',
            selected: true,
          };
          marked[dateStr].customContainerStyle = {
            ...marked[dateStr].customContainerStyle,
            backgroundColor: colors.period,
            borderRadius: 18,
            elevation: 4,
          };
        } else {
          marked[dateStr] = {
            color: colors.period + "33",
            customTextStyle: {
              fontWeight: '500',
              color: '#fb778bC',
            },
          };
        }
      });
    } else {
      // Fallback: Show predicted current period if no actual data
      const start = new Date(data.lastPeriodStart);
      for (let i = 0; i < periodLen; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const isFirst = i === 0;
        const isLast = i === periodLen - 1;

        if (isFirst) {
          marked[dateStr] = {
            startingDay: true,
            color: colors.period + "66",
            textColor: 'white',
            selected: true,
          };
          marked[dateStr].customContainerStyle = {
            ...marked[dateStr].customContainerStyle,
            backgroundColor: colors.period,
            borderRadius: 18,
            elevation: 4,
          };
        } else if (isLast) {
          marked[dateStr] = {
            endingDay: true,
            color: colors.period + "66",
            textColor: 'white',
            selected: true,
          };
          marked[dateStr].customContainerStyle = {
            ...marked[dateStr].customContainerStyle,
            backgroundColor: colors.period,
            borderRadius: 18,
            elevation: 4,
          };
        } else {
          marked[dateStr] = {
            color: colors.period + "33",
            customTextStyle: {
              fontWeight: '500',
              color: '#fb778bC',
            },
          };
        }
      }
    }

    // Priority 2: Show predicted period ONLY if no actual period exists for those dates
    const nextStart = new Date(cycleData.nextPeriodResult.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextStartNormalized = new Date(nextStart);
    nextStartNormalized.setHours(0, 0, 0, 0);

    // Only show prediction if:
    // - No lastPeriodEnd exists (period hasn't ended yet)
    // - Predicted date is in the future
    // - No actual flow data exists for predicted period dates
    const shouldShowPrediction = !data.lastPeriodEnd && nextStartNormalized >= today;

    if (shouldShowPrediction) {
      // Check if any predicted dates have actual flow data
      let hasActualFlowInPrediction = false;
      for (let i = 0; i < periodLen; i++) {
        const d = new Date(nextStart);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const log = dailyLogs.find(l => l.date === dateStr);
        if (log && isValidPeriodFlow(log.flow)) {
          hasActualFlowInPrediction = true;
          break;
        }
      }

      // Only show prediction if no actual flow exists
      if (!hasActualFlowInPrediction) {
        for (let i = 0; i < periodLen; i++) {
          const d = new Date(nextStart);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const isFirst = i === 0;
          const isLast = i === periodLen - 1;

          if (!marked[dateStr]) {
            if (isFirst) {
              marked[dateStr] = {
                startingDay: true,
                color: colors.period + "30",
                textColor: 'white',
                selected: true,
              };
              marked[dateStr].customContainerStyle = {
                ...marked[dateStr].customContainerStyle,
                backgroundColor: colors.period + "60",
                borderRadius: 18,
                elevation: 4,
              };
            } else if (isLast) {
              marked[dateStr] = {
                endingDay: true,
                color: colors.period + "30",
                textColor: 'white',
                selected: true,
              };
              marked[dateStr].customContainerStyle = {
                ...marked[dateStr].customContainerStyle,
                backgroundColor: colors.period + "60",
                borderRadius: 18,
                elevation: 4,
              };
            } else {
              marked[dateStr] = {
                color: colors.period + '15',
                textColor: colors.period,
                customTextStyle: {
                  opacity: 0.7,
                },
              };
            }
          }
        }
      }
    }

    // 3. Fertile Window
    if (cycleData.fertileWindow) {
      const lastPeriod = new Date(data.lastPeriodStart);
      for (let i = cycleData.fertileWindow.startDay; i <= cycleData.fertileWindow.endDay; i++) {
        const d = new Date(lastPeriod);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];

        // If not already marked as period, add fertile marking
        if (!marked[dateStr] || !marked[dateStr].color) {
          if (!marked[dateStr]) {
            marked[dateStr] = {};
          }
          marked[dateStr].marked = true;
          marked[dateStr].customContainerStyle = {
            borderWidth: 2,
            borderColor: colors.fertile,
            borderRadius: 18,
            backgroundColor: colors.fertile + '20',
          };
          marked[dateStr].customTextStyle = {
            color: colors.fertile,
            fontWeight: 'bold',
          };
        } else {
          // If already in period, add a dot marker
          marked[dateStr].marked = true;
          marked[dateStr].dotColor = 'white';
        }
      }
    }

    // 4. Ovulation
    if (cycleData.ovulationDate) {
      const dateStr = cycleData.ovulationDate.toISOString().split('T')[0];

      if (!marked[dateStr]) {
        marked[dateStr] = {};
      }

      marked[dateStr].marked = true;
      marked[dateStr].dotColor = colors.ovulation;
      marked[dateStr].customContainerStyle = {
        ...marked[dateStr].customContainerStyle,
        borderWidth: 2,
        borderColor: colors.ovulation,
        borderRadius: 18,
        backgroundColor: marked[dateStr].customContainerStyle?.backgroundColor || colors.ovulation + '20',
      };
      if (!marked[dateStr].textColor) {
        marked[dateStr].customTextStyle = {
          ...marked[dateStr].customTextStyle,
          color: colors.ovulation,
          fontWeight: 'bold',
          fontSize: 14,
        };
      }
    }

    // 5. Selected Day (Today)
    if (selected) {
      if (!marked[selected]) {
        marked[selected] = {};
      }

      // Preserve period marking if exists, but override container style for selected
      marked[selected].selected = true;
      // marked[selected].selectedColor = colors.lavender;
      marked[selected].customContainerStyle = {
        ...marked[selected].customContainerStyle,
      };
      marked[selected].customTextStyle = {
        ...marked[selected].customTextStyle,
        // color: 'white',
        fontWeight: 'bold',
      };
    }

    return marked;
  }, [cycleData, data, selected, actualPeriod, dailyLogs]);


  const getPhaseDisplay = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return {
          name: 'Menstruación',
          color: 'text-rose-600',
          bgColor: 'bg-rose-500/10',
          chance: 'Probabilidad muy baja de embarazo.',
          image: require('@/assets/images/flower.webp'),
        };
      case 'follicular':
        return {
          name: 'Fase Folicular',
          color: 'text-blue-600',
          bgColor: 'bg-blue-500/10',
          chance: 'Probabilidad baja de embarazo.',
          image: require('@/assets/images/flower.webp'),
        };
      case 'ovulatory':
        return {
          name: 'Ovulación',
          color: 'text-purple-600',
          bgColor: 'bg-purple-500/10',
          chance: 'Probabilidad alta de embarazo.',
          image: require('@/assets/images/flower.webp'),
        };
      case 'luteal':
      default:
        return {
          name: 'Fase Lútea',
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
          chance: 'Probabilidad baja de embarazo.',
          image: require('@/assets/images/flower.webp'),
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
        </Text>

        <View className="flex-row gap-3 items-center">
          <SyncStatusIndicator />
          <TouchableOpacity
            onPress={() => {
              // nav to history screen
              router.push('/history');
            }}
            className="h-10 w-10 items-center justify-center rounded-full bg-background"
          >
            <MyIcon name="History" className="text-text-primary" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-24" />

        {/* ───── Calendar ───── */}
        <View className="bg-background rounded-3xl p-2">
          <MyCalendar
            current={currentMonth.toISOString().split('T')[0]}
            markingType='period'
            markedDates={markedDates as any}
            onMonthChange={(month) => {
              setCurrentMonth(new Date(month.timestamp))
            }}
            onDayPress={onDayPress}
            enableSwipeMonths
            theme={getTheme() as any}
            renderArrow={(direction) => {
              return (
                <MyIcon name={direction === 'left' ? 'ChevronLeft' : 'ChevronRight'} className="text-text-primary" />
              )
            }}
            className='font-sans!'
          // showWeekNumbers
          // showSixWeeks
          // hideExtraDays
          // hideDayNames
          // hideArrows
          />
        </View>

        {/* ───── Legend ───── */}
        <View className="mt-6 p-4 rounded-3xl flex-row justify-around items-center bg-white border border-gray-100 shadow-md">
          <LegendDot color={colors.period} label="Periodo" />
          <LegendDot color={colors.fertile} label="Fértil" />
          <LegendRing color={colors.ovulation} label="Ovulación" />
        </View>

        {/* ───── Status Card ───── */}
        <View className="mt-4">
          <View className="flex-row gap-4 rounded-3xl bg-white p-5 border border-gray-100 shadow-md">
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
              source={phaseDisplay.image}
              className="w-20 h-full rounded-2xl"
            />
          </View>
        </View>

        {/* ───── FAB ───── */}
        <View className="mt-6 mb-10 gap-3">
          {periodButtons.markEndButton}
          {periodButtons.startButton}
          {periodButtons.registerButton}
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
      <Text className="text-xs text-text-primary font-medium bg-transparent">{label}</Text>
    </View>
  )
}

function LegendRing({ color, label }: any) {
  return (
    <View className="items-center gap-1">
      <View className="size-3 border-2 border-ovulation rounded-full bg-transparent" />
      <Text className="text-xs text-text-primary font-medium bg-transparent">{label}</Text>
    </View>
  )
}
