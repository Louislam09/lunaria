import { NotificationsMenu } from '@/components/NotificationsMenu';
import { ProfileMenu } from '@/components/ProfileMenu';
import { MyImage } from '@/components/ui';
import { CircularProgress } from '@/components/ui/CircularProgress';
import MyIcon from '@/components/ui/Icon';
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator';
import Tooltip from '@/components/ui/Tooltip';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCyclePredictions } from '@/hooks/useCyclePredictions';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { getAllScheduledNotifications } from '@/services/notifications';
import { colors } from '@/utils/colors';
import { formatDate } from '@/utils/dates';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { data, isLoading, isComplete } = useOnboarding();

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

  const { preferences } = useNotificationManager();
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);

  // Load scheduled notifications for unread count
  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = async () => {
    try {
      const scheduled = await getAllScheduledNotifications();
      setScheduledNotifications(scheduled);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const resumeInsights = [
    { emoji: "☀️", icon: "Sun", title: "Estado de ánimo", text: "Es normal sentirse más introspectiva hoy.", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { emoji: "💖", icon: "Heart", title: "Recomendación", text: "Ideal para yoga suave o meditación.", iconBg: "bg-purple-100", iconColor: "text-purple-600" }
  ];

  const risk = pregnancyRisk;
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  // Calculate unread notifications count based on actual scheduled notifications and cycle state
  const unreadNotificationsCount = useMemo(() => {
    if (!preferences?.enabled) return 0;
    
    let count = 0;
    const now = new Date();
    
    // Count upcoming scheduled notifications
    const upcomingNotifications = scheduledNotifications.filter(n => {
      if (n.trigger && typeof n.trigger === 'object' && 'date' in n.trigger) {
        const triggerDate = new Date(n.trigger.date as number);
        return triggerDate.getTime() > now.getTime();
      }
      return false;
    });
    
    count += upcomingNotifications.length;
    
    // Add active notifications based on cycle state
    if (daysUntilPeriod <= 3 && daysUntilPeriod > 0 && preferences.periodReminders.enabled) {
      count++;
    }
    
    if (fertileWindow && data.lastPeriodStart && preferences.fertileWindowReminders.enabled) {
      const lastPeriod = new Date(data.lastPeriodStart);
      const fertileStartDay = fertileWindow.startDay;
      const fertileEndDay = fertileWindow.endDay;
      const today = new Date();
      const daysSincePeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (daysSincePeriod >= fertileStartDay && daysSincePeriod <= fertileEndDay) {
        count++;
      }
    }
    
    // Always show daily log reminder if enabled
    if (preferences.dailyLogReminder.enabled) {
      count++;
    }
    
    return count;
  }, [daysUntilPeriod, fertileWindow, data.lastPeriodStart, scheduledNotifications, preferences]);

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
                  source={require("@/assets/images/avatar.jpg")}
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
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="h-16" />

        {/* Next period card */}
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
                {/* 5 */}
                {daysUntilPeriod}
              </Text>
              <Text className="text-text-muted text-base">días</Text>
            </View>
          </View>

          <Text className="text-lg font-bold mt-4 text-text-primary">
            {/* Jueves, 24 de Octubre */}
            {formatDate(nextPeriodResult.date, 'long')}
          </Text>

          <View className="mt-2 px-3 py-1 w-fit rounded-full bg-primary/20">
            <Text className="text-primary text-sm font-bold">
              Predicción {data.cycleType === 'regular' ? 'regular' : 'irregular'}
            </Text>
          </View>
        </View>

        {/* Current phase */}
        <View className="w-full mt-6 bg-primary/10 rounded-[32px] p-5 shadow-md border border-primary/10 relative ">
          <View className='w-full h-full absolute inset-0 bg-white/70 m-5 rounded-3xl blur-sm' />

          <View className="flex-row items-center gap-2 mb-3">
            <MyIcon name="Droplet" size={20} className="text-primary fill-primary" />

            <Text className="text-primary font-bold uppercase text-sm">
              Estado actual
            </Text>
          </View>

          <Text className="text-2xl font-bold text-text-primary">
            {/* Fase Lútea */}
            {getPhaseName(phase)}
          </Text>

          <Text className="text-text-muted mt-2">
            {/* Día 19 del ciclo. Tu energía puede empezar a disminuir. */}
            {getPhaseDescription(phase, cycleDay)}
          </Text>

          <TouchableOpacity onPress={() => router.push('/registro')} activeOpacity={0.6} className="w-full mt-5 bg-primary py-5 rounded-full items-center justify-center flex-row gap-2">
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

        {/* Insights */}
        <Text className="mt-8 mb-4 text-xl font-bold text-text-primary">
          Resumen de hoy
        </Text>

        <ScrollView className="flex-row gap-4 py-1" horizontal showsHorizontalScrollIndicator={false}>
          {resumeInsights.map((item, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.6}
              className="w-64 mr-4 bg-white p-4 rounded-3xl border border-gray-200 shadow-md"
            >
              <View className={`h-10 w-10 rounded-full ${item.iconBg} items-center justify-center mb-3`}>
                <MyIcon name={item.icon as any} size={20} className={`${item.iconColor} fill-${item.iconColor}`} />
                {/* <Text className="text-2xl">{item.emoji}</Text> */}
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

