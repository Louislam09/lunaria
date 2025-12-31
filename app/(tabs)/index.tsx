import { NotificationsMenu } from '@/components/NotificationsMenu';
import { ProfileMenu } from '@/components/ProfileMenu';
import { MyImage } from '@/components/ui';
import { CircularProgress } from '@/components/ui/CircularProgress';
import MyIcon from '@/components/ui/Icon';
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator';
import Tooltip from '@/components/ui/Tooltip';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { getAvatarSource } from '@/utils/avatar';
import { useCyclePredictions } from '@/hooks/useCyclePredictions';
import { usePeriodConfirmation } from '@/hooks/usePeriodConfirmation';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { usePremium } from '@/hooks/usePremium';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CyclesService } from '@/services/dataService';
import { getAllScheduledNotifications } from '@/services/notifications';
import { getReadNotifications } from '@/services/readNotifications';
import { colors } from '@/utils/colors';
import { formatDate } from '@/utils/dates';
import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { PHASE_INSIGHTS } from '@/constants/phaseInsights';
import { PremiumGate } from '@/components/premium/PremiumGate';

export default function HomeScreen() {
  const { data, isLoading, isComplete, updateData } = useOnboarding();
  const { user, isAuthenticated, localUserId } = useAuth();
  const { alert, alertSuccess } = useAlert();

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!isLoading && !isComplete) {
      router.replace('/onboarding/info');
    }
  }, [isLoading, isComplete]);

  const {
    nextPeriodResult,
    cycleDay,
    phase,
    daysUntilPeriod,
    progress,
    userName,
    greeting,
    getPhaseName,
    getPhaseDescription,
    pregnancyRisk,
    fertileWindow,
  } = useCyclePredictions(data);

  const { needsConfirmation, predictedDate, checkConfirmation } = usePeriodConfirmation();

  const { preferences } = useNotificationManager();
  const { isPremium } = usePremium();
  const { analytics } = useAnalytics();
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const confirmationShownRef = useRef(false);
  const [currentDelay, setCurrentDelay] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load scheduled notifications and read status for unread count
  useEffect(() => {
    loadScheduledNotifications();
    loadReadNotifications();
    loadCurrentDelay();
  }, []);

  // Load current delay if period is delayed
  const loadCurrentDelay = async () => {
    if (!predictedDate || !data.lastPeriodStart) return;

    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) return;

    try {
      const predictedDateStr = new Date(predictedDate);
      predictedDateStr.setHours(0, 0, 0, 0);
      const dateStr = predictedDateStr.toISOString().split('T')[0];

      const cycle = await CyclesService.getByStartDate(userId, dateStr);
      if (cycle && cycle.delay > 0) {
        setCurrentDelay(cycle.delay);
      } else {
        setCurrentDelay(null);
      }
    } catch (error) {
      console.error('Error loading current delay:', error);
    }
  };

  // Reload delay when predicted date changes
  useEffect(() => {
    if (predictedDate) {
      loadCurrentDelay();
    }
  }, [predictedDate]);

  // Check for period confirmation when component mounts or data changes
  useEffect(() => {

    if (isComplete && data.lastPeriodStart && needsConfirmation && predictedDate && !confirmationShownRef.current) {
      confirmationShownRef.current = true;
      handlePeriodConfirmation();
    }

    // Reset confirmation flag if needsConfirmation becomes false (e.g., user confirmed or new day)
    if (!needsConfirmation) {
      confirmationShownRef.current = false;
    }
  }, [isComplete, needsConfirmation, predictedDate]);

  const handlePeriodConfirmation = async () => {
    if (!predictedDate) return;

    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const predictedDateObj = new Date(predictedDate);
    predictedDateObj.setHours(0, 0, 0, 0);
    const daysDelay = Math.floor((today.getTime() - predictedDateObj.getTime()) / (1000 * 60 * 60 * 24));

    // Check if there's already a delay recorded
    const predictedDateStr = predictedDateObj.toISOString().split('T')[0];
    const existingCycle = await CyclesService.getByStartDate(userId, predictedDateStr);
    const hasExistingDelay = existingCycle && existingCycle.delay > 0;

    // Build message based on whether delay already exists
    const message = hasExistingDelay && daysDelay > existingCycle.delay
      ? `Tu periodo se retrasó ${existingCycle.delay} día${existingCycle.delay > 1 ? 's' : ''} y ahora lleva ${daysDelay} día${daysDelay > 1 ? 's' : ''} de retraso. ¿Ya llegó?`
      : `Según nuestras predicciones, tu periodo debería haber llegado ${daysDelay === 0 ? 'hoy' : `hace ${daysDelay} día${daysDelay > 1 ? 's' : ''}`} (${formatDate(predictedDate, 'long')}). ¿Ya llegó?`;

    alert({
      title: '¿Llegó tu periodo?',
      message: message,
      type: 'warning',
      buttons: [
        {
          text: 'No',
          style: 'cancel',
          onPress: async () => {
            // User says NO - it's a delay (retraso)
            try {
              // Mark delay on cycle (will update if already exists)
              await CyclesService.markDelay(userId, predictedDateStr, daysDelay);

              // Reload delay to update UI
              await loadCurrentDelay();

              alertSuccess(
                'Retraso registrado',
                `Hemos registrado que tu periodo se retrasó ${daysDelay} día${daysDelay > 1 ? 's' : ''}. Te notificaremos cuando llegue.`
              );

              await checkConfirmation();
            } catch (error) {
              console.error('Error marking delay:', error);
            }
          },
        },
        {
          text: 'Sí',
          style: 'default',
          onPress: async () => {
            // User says YES - period arrived
            try {
              // Navigate to registro screen with today's date to log the period
              router.push(`/registro?date=${todayStr}`);
              await checkConfirmation();
            } catch (error) {
              console.error('Error navigating to registro:', error);
            }
          },
        },
      ],
    });
  };

  const loadScheduledNotifications = async () => {
    try {
      const scheduled = await getAllScheduledNotifications();
      setScheduledNotifications(scheduled);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const loadReadNotifications = async () => {
    try {
      const readIds = await getReadNotifications();
      setReadNotifications(readIds);
    } catch (error) {
      console.error('Error loading read notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload data
      await loadScheduledNotifications();
      await loadReadNotifications();
      await loadCurrentDelay();
      await checkConfirmation();

      // Check for app updates if enabled
      if (Updates.isEnabled) {
        try {
          const update = await Updates.checkForUpdateAsync();

          if (!update.isAvailable) {
            alertSuccess('Ya tienes la última versión ✅');
            return;
          }

          if (update.isAvailable) {
            // Silently download update in background
            await Updates.fetchUpdateAsync();
            // Show success message
            alertSuccess(
              'Actualización disponible',
              'Se ha descargado una nueva actualización. La aplicación se reiniciará para aplicar los cambios.'
            );
            // Reload after a short delay
            setTimeout(() => {
              Updates.reloadAsync();
            }, 1000);
          }
        } catch (updateError) {
          // Silently fail update check - don't show error to user
          console.log('Update check failed:', updateError);
        }
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get phase-specific insights
  const resumeInsights = useMemo(() => {
    return PHASE_INSIGHTS[phase] || PHASE_INSIGHTS.luteal;
  }, [phase]);

  // Get phase colors
  const getPhaseColors = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return {
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/20',
          iconColor: 'text-rose-600',
          textColor: 'text-rose-600',
          buttonBg: 'bg-rose-600',
        };
      case 'follicular':
        return {
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-600',
          buttonBg: 'bg-blue-600',
        };
      case 'ovulatory':
        return {
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
          iconColor: 'text-purple-600',
          textColor: 'text-purple-600',
          buttonBg: 'bg-purple-600',
        };
      case 'luteal':
      default:
        return {
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          iconColor: 'text-green-600',
          textColor: 'text-green-600',
          buttonBg: 'bg-green-600',
        };
    }
  };

  const phaseColors = getPhaseColors(phase);

  const risk = pregnancyRisk;
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  // Calculate unread notifications count based on actual scheduled notifications and cycle state
  const unreadNotificationsCount = useMemo(() => {
    if (!preferences?.enabled) return 0;

    let count = 0;
    const now = new Date();

    // Count upcoming scheduled notifications that are unread
    const upcomingNotifications = scheduledNotifications.filter(n => {
      if (n.trigger && typeof n.trigger === 'object' && 'date' in n.trigger) {
        const triggerDate = new Date(n.trigger.date as number);
        const isUpcoming = triggerDate.getTime() > now.getTime();
        const isRead = readNotifications.has(`scheduled-${n.identifier}`);
        return isUpcoming && !isRead;
      }
      return false;
    });

    count += upcomingNotifications.length;

    // Add active notifications based on cycle state (only if unread)
    if (daysUntilPeriod <= 3 && daysUntilPeriod > 0 && preferences.periodReminders.enabled) {
      if (!readNotifications.has('period-approaching')) {
        count++;
      }
    }

    if (fertileWindow && data.lastPeriodStart && preferences.fertileWindowReminders.enabled) {
      const lastPeriod = new Date(data.lastPeriodStart);
      const fertileStartDay = fertileWindow.startDay;
      const fertileEndDay = fertileWindow.endDay;
      const today = new Date();
      const daysSincePeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (daysSincePeriod >= fertileStartDay && daysSincePeriod <= fertileEndDay) {
        if (!readNotifications.has('fertile-window')) {
          count++;
        }
      }
    }

    // Daily log reminder if enabled and unread
    if (preferences.dailyLogReminder.enabled && !readNotifications.has('daily-log')) {
      count++;
    }

    return count;
  }, [daysUntilPeriod, fertileWindow, data.lastPeriodStart, scheduledNotifications, preferences, readNotifications]);

  if (isLoading || !isComplete || !data.lastPeriodStart || !data.cycleType || !data.periodLength) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">

      {/* Header */}
      <View className='absolute top-0 left-0 right-0 z-20 flex-row justify-between items-center px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm'>
        <View>
          <Text className="text-sm text-gray-500">{greeting}</Text>
          <Text className="text-2xl font-bold text-text-primary">
            Hola, {userName}
          </Text>
        </View>

        <View className="flex-row gap-3 items-center">
          <SyncStatusIndicator />
          <Tooltip
            offset={10}
            target={
              <Pressable
                onPress={() => {
                  setIsNotificationsVisible(!isNotificationsVisible);
                  loadScheduledNotifications(); // Refresh when opening
                  loadReadNotifications(); // Refresh read status
                }}
                className="h-10 w-10 rounded-full bg-background items-center justify-center relative"
              >
                <MyIcon name="Bell" size={24} className="text-text-primary fill-white" />
                {/* Unread indicator */}
                {unreadNotificationsCount > 0 && (
                  <View className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
                )}
              </Pressable>
            }
            isVisible={isNotificationsVisible}
            onClose={() => setIsNotificationsVisible(false)}
          >
            <NotificationsMenu onMenuClose={() => setIsNotificationsVisible(false)} />
          </Tooltip>

          <Tooltip
            offset={10}
            target={
              <Pressable onPress={() => setIsTooltipVisible(!isTooltipVisible)} className="h-10 w-10 rounded-full bg-background items-center justify-center">
                <MyImage
                  source={getAvatarSource(data.avatarUrl)}
                  contentFit="contain"
                  className="h-10 w-10 border border-gray-400 rounded-full"
                />
              </Pressable>
            }
            isVisible={isTooltipVisible}
            onClose={() => setIsTooltipVisible(false)}>
            <ProfileMenu onMenuClose={() => setIsTooltipVisible(false)} />
          </Tooltip>
        </View>
      </View>

      {/* Scroll content */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.lavender}
            colors={[colors.lavender]}
          />
        }
      >
        <View className="h-16" />

        {/* Delayed Period Card or Next Period Card */}
        {currentDelay && currentDelay > 0 ? (
          <View className="mt-6 bg-rose-50 rounded-[40px] p-6 items-center border border-rose-100">
            {/* Header with exclamation icon */}
            <View className="flex-row items-center gap-2 mb-4">
              <MyIcon name="CircleAlert" size={24} className="text-red-500" />
              <Text className="uppercase text-base font-bold text-red-500">
                PERIODO RETRASADO
              </Text>
            </View>

            {/* Circular delay indicator */}
            <View className="w-50 h-50 items-center justify-center mb-4">
              <CircularProgress
                value={100}
                size={180}
                color="#EF4444"
              />

              <View className="absolute items-center">
                <Text className="text-6xl font-bold text-text-primary">
                  {currentDelay}
                </Text>
                <Text className="text-red-500 text-base font-medium">
                  día{currentDelay > 1 ? 's' : ''} de retraso
                </Text>
              </View>
            </View>

            <Text className="text-xl font-bold mt-2 text-text-primary">
              Esperando inicio
            </Text>

            <Text className="text-sm text-text-muted text-center mt-3 px-4">
              La predicción puede variar. Consulta tu médico si tienes dudas.
            </Text>
          </View>
        ) : (
          <View className="mt-6 bg-background rounded-[40px] p-6 items-center">
            <Text className="uppercase text-base font-medium text-text-muted mb-4">
              Próximo periodo
            </Text>

            {/* Circular counter */}
            <View className="w-50 h-50 items-center justify-center">
              <CircularProgress
                value={progress}
                size={180}
                color={colors.lavender}
              />

              <View className="absolute items-center">
                <Text className="text-6xl font-bold text-text-primary">
                  {daysUntilPeriod}
                </Text>
                <Text className="text-text-muted text-base">días</Text>
              </View>
            </View>

            <Text className="text-lg font-bold mt-4 text-text-primary">
              {formatDate(nextPeriodResult.date, 'long')}
            </Text>

            <View className="mt-2 px-3 py-1 w-fit rounded-full bg-primary/20">
              <Text className="text-primary text-sm font-bold">
                Predicción {data.cycleType === 'regular' ? 'regular' : 'irregular'}
              </Text>
            </View>
          </View>
        )}

        {/* Current phase */}
        <View className={`w-full mt-6 ${currentDelay && currentDelay > 0 ? 'bg-orange-50 border-orange-200' : phaseColors.bgColor} rounded-[32px] p-5 shadow-md border ${currentDelay && currentDelay > 0 ? 'border-orange-200' : phaseColors.borderColor} relative `}>
          <View className='w-full h-full absolute inset-0 bg-white/70 m-5 rounded-3xl blur-sm' />

          <View className="flex-row items-center gap-2 mb-3">
            <MyIcon name="Droplet" size={20} className={`${currentDelay && currentDelay > 0 ? 'text-orange-500' : phaseColors.iconColor} fill-current`} />

            <Text className={`${currentDelay && currentDelay > 0 ? 'text-orange-500' : phaseColors.textColor} font-bold uppercase text-sm`}>
              Estado actual
            </Text>
          </View>

          <Text className="text-2xl font-bold text-text-primary">
            {currentDelay && currentDelay > 0 ? 'Ciclo Extendido' : getPhaseName(phase)}
          </Text>

          <Text className="text-text-muted mt-2">
            {currentDelay && currentDelay > 0
              ? `Día ${cycleDay} del ciclo. Es normal tener variaciones ocasionales.`
              : getPhaseDescription(phase, cycleDay)
            }
          </Text>

          <TouchableOpacity onPress={() => router.push('/registro')} activeOpacity={0.6} className={`w-full mt-5 ${currentDelay && currentDelay > 0 ? 'bg-orange-500' : phaseColors.buttonBg} py-5 rounded-full items-center justify-center flex-row gap-2`}>
            <MyIcon name="NotebookPen" size={20} className="text-white " />
            <Text className="text-white font-bold text-base">
              Registrar síntomas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pregnancy risk */}
        <View className={`mt-6 flex-row items-center justify-between gap-4 rounded-[32px] p-5 py-8 shadow-md bg-linear-to-br from-${risk.color}-50 to-white border ${risk.borderColor}`}>
          <View className="flex-1 flex flex-col gap-4">
            <View className="flex flex-row items-center gap-2 w-full">
              <MyIcon name="Smile" size={20} className={`${risk.textColor} fill-${risk.color}`} />
              <Text className={`text-lg font-bold uppercase flex-1 ${risk.textColor}`}>
                Riesgo de embarazo
              </Text>
            </View>
            <Text className={`text-2xl font-semibold text-text-primary `}>
              <View className={`w-2 h-2 mr-1 rounded-full ${risk.color}`} />{" "}
              {risk.label}
            </Text>
          </View>
          <View className={`w-16 h-16 rounded-full ${risk.bgColor} flex items-center justify-center`}>
            {/* <MyIcon name="Shield" size={32} className="text-green-500 fill-green-500" /> */}
            <View className={`absolute top-0 right-0 w-4 h-4 rounded-full bg-${risk.color}-500 flex items-center justify-center `} />
            <MyIcon name="Shield" size={32} className={`${risk.textColor} fill-${risk.color}`} />
          </View>
        </View>

        {/* Premium Analytics Insights */}
        {isPremium && analytics && analytics.totalCycles > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-text-primary">
                Análisis Premium
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/analytics')}
                className="flex-row items-center gap-1"
              >
                <Text className="text-primary font-semibold text-sm">Ver más</Text>
                <MyIcon name="ChevronRight" className="text-primary" size={16} />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-4 border border-primary/20">
                <View className="flex-row items-center gap-2 mb-2">
                  <MyIcon name="TrendingUp" className="text-primary" size={18} />
                  <Text className="text-xs font-semibold text-primary uppercase">
                    Regularidad
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-text-primary">
                  {analytics.cycleRegularityScore}%
                </Text>
                <Text className="text-xs text-text-muted mt-1">
                  {analytics.cycleRegularityScore >= 80
                    ? 'Muy regular'
                    : analytics.cycleRegularityScore >= 60
                    ? 'Regular'
                    : 'Irregular'}
                </Text>
              </View>

              <View className="flex-1 bg-gradient-to-br from-green-50 to-green-100/50 rounded-3xl p-4 border border-green-200">
                <View className="flex-row items-center gap-2 mb-2">
                  <MyIcon name="BarChart" className="text-green-600" size={18} />
                  <Text className="text-xs font-semibold text-green-600 uppercase">
                    Promedio
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-text-primary">
                  {analytics.averageCycleLength}
                </Text>
                <Text className="text-xs text-text-muted mt-1">días por ciclo</Text>
              </View>
            </View>

            {analytics.symptomPatterns.length > 0 && (
              <View className="mt-3 bg-white rounded-3xl p-4 border border-gray-200 shadow-md">
                <Text className="text-sm font-semibold text-text-primary mb-2">
                  Síntoma más frecuente
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-text-primary">
                    {analytics.symptomPatterns[0].symptom}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-text-muted">
                      {analytics.symptomPatterns[0].frequency}x
                    </Text>
                    <View className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary"
                        style={{ width: `${analytics.symptomPatterns[0].percentage}%` }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Insights */}
        <Text className="mt-8 mb-4 text-xl font-bold text-text-primary">
          Resumen de hoy
        </Text>

        <ScrollView className="flex-row gap-4 py-1" horizontal showsHorizontalScrollIndicator={false}>
          {resumeInsights.map((item, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.6}
              className={`w-64 mr-4 bg-white p-4 rounded-3xl border ${phaseColors.borderColor} shadow-md`}
            >
              <View className={`h-10 w-10 rounded-full ${item.iconBg} items-center justify-center mb-3`}>
                <MyIcon name={item.icon as any} size={20} className={`${item.iconColor} fill-current`} />
              </View>

              <Text className="font-bold text-text-primary">
                {item.title}
              </Text>

              <Text className="text-text-muted mt-1">
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="h-32" />
      </ScrollView>

    </View>
  )
}

