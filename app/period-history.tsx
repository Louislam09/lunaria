import MyIcon from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useDailyLogs, useCycles } from '@/hooks/useReactiveData';
import { colors } from '@/utils/colors';
import { formatDate } from '@/utils/dates';
import { getAllPeriods, PeriodHistoryItem } from '@/utils/periodHistory';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PeriodHistoryScreen() {
  const { user, isAuthenticated, localUserId } = useAuth();
  const { data, isLoading: onboardingLoading, isComplete } = useOnboarding();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const userId = isAuthenticated && user ? user.id : localUserId;
  const { averageCycleLength = 28 } = data;

  // Use reactive hooks - automatically updates when data changes
  const logs = useDailyLogs(userId || '');
  const cycles = useCycles(userId || '');

  // Calculate periods reactively
  const periods = useMemo(() => {
    if (!userId) return [];

    const lastPeriodStart = data.lastPeriodStart ? new Date(data.lastPeriodStart) : undefined;
    return getAllPeriods(logs, cycles, averageCycleLength, lastPeriodStart);
  }, [logs, cycles, data.lastPeriodStart, averageCycleLength, userId]);

  const isLoading = onboardingLoading;

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!onboardingLoading && !isComplete) {
      router.replace('/onboarding/wizard');
    }
  }, [onboardingLoading, isComplete]);

  const onRefresh = async () => {
    // Refresh is handled automatically by reactive hook, but we can show loading state
    setRefreshing(true);
    // Small delay to show refresh animation
    setTimeout(() => setRefreshing(false), 500);
  };

  const handlePeriodPress = (period: PeriodHistoryItem) => {
    // Navigate to register screen for the period start date
    router.push({
      pathname: '/register',
      params: {
        date: period.startDate,
      },
    });
  };

  const formatPeriodDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return formatDate(date, 'short');
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'pageSheet'
        }}
      />

      {/* Header */}
      <View
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-6 pb-4 bg-background/90 backdrop-blur-sm"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between w-full">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <MyIcon name="ChevronLeft" size={20} className="text-text-primary" />
          </Pressable>

          <Text className="text-2xl font-bold text-text-primary flex-1 text-center mr-10">
            Historial de Periodos
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.lavender}
          />
        }
        contentContainerStyle={{ paddingTop: 80 }}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-text-muted">Cargando...</Text>
          </View>
        ) : periods.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
              <MyIcon name="Calendar" size={48} className="text-primary" />
            </View>
            <Text className="text-text-muted text-center text-base mb-2">
              No hay periodos registrados aún
            </Text>
            <Text className="text-text-muted text-center text-sm">
              Los periodos aparecerán aquí cuando registres días con flujo
            </Text>
          </View>
        ) : (
          <>
            {periods.map((period, index) => {
              const startFormatted = formatPeriodDate(period.startDate);
              const endFormatted = formatPeriodDate(period.endDate);

              // Build subtitle with period details
              let subtitle = `${startFormatted} - ${endFormatted} • ${period.duration} día${period.duration > 1 ? 's' : ''}`;

              if (period.cycleLength) {
                subtitle += ` • Ciclo: ${period.cycleLength} día${period.cycleLength > 1 ? 's' : ''}`;
              }

              if (period.delay && period.delay > 0) {
                subtitle += ` • Retraso: ${period.delay} día${period.delay > 1 ? 's' : ''}`;
              }

              const isMostRecent = index === 0;

              return (
                <Pressable
                  key={`${period.startDate}-${index}`}
                  onPress={() => handlePeriodPress(period)}
                  className="flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:scale-[0.99]"
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View
                      className={`h-12 w-12 items-center justify-center rounded-full ${isMostRecent
                        ? 'bg-pink-100'
                        : period.delay && period.delay > 0
                          ? 'bg-orange-100'
                          : 'bg-purple-100'
                        }`}
                    >
                      <MyIcon
                        name={isMostRecent ? "Clock" : "Check"}
                        size={24}
                        className={
                          isMostRecent
                            ? 'text-pink-500'
                            : period.delay && period.delay > 0
                              ? 'text-orange-500'
                              : 'text-purple-500'
                        }
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-bold text-text-primary mb-1">
                        {period.month}
                      </Text>
                      <Text className="text-sm font-medium text-text-muted">
                        {subtitle}
                      </Text>
                    </View>
                  </View>

                  <MyIcon name="ChevronRight" size={20} className="text-gray-400" />
                </Pressable>
              );
            })}

            {/* End of list */}
            {periods.length > 0 && (
              <View className="items-center justify-center py-8 opacity-60">
                <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
                  <MyIcon name="FileText" size={48} className="text-primary" />
                </View>
                <Text className="text-text-muted text-sm text-center">
                  No hay más periodos anteriores.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
