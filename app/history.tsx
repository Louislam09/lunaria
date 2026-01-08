import MyIcon from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCyclePredictions } from '@/hooks/useCyclePredictions';
import { DailyLogsService } from '@/services/dataService';
import { colors } from '@/utils/colors';
import { getCycleDay } from '@/utils/predictions';
import { router, Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'all' | 'period' | 'thisWeek' | 'thisMonth' | 'last3Months';

interface DailyLog {
  id: string;
  date: string;
  symptoms: string[];
  flow: string;
  mood: string;
  notes: string;
  synced: boolean;
  updated_at: string;
}

interface GroupedLogs {
  month: string;
  year: number;
  cycle?: number;
  logs: DailyLog[];
}

const FLOW_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  leve: { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-400' },
  ligero: { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-400' },
  medio: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  alto: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-600' },
  abundante: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-600' },
  mancha: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
};

const MOOD_EMOJIS: Record<string, string> = {
  feliz: '😊',
  triste: '😢',
  irritable: '😠',
  sensible: '😭',
  ansiosa: '😰',
  calmada: '😌',
  energética: '⚡️',
  cariñosa: '🥰',
};

const getFlowLabel = (flow: string): string => {
  const labels: Record<string, string> = {
    leve: 'Flujo Ligero',
    ligero: 'Flujo Ligero',
    medio: 'Flujo Medio',
    alto: 'Flujo Alto',
    abundante: 'Flujo Abundante',
    mancha: 'Mancha',
  };
  return labels[flow.toLowerCase()] || flow;
};

const getMoodLabel = (mood: string): string => {
  const moods = mood.split(',').map(m => m.trim().toLowerCase());
  return moods.map(m => {
    const labels: Record<string, string> = {
      feliz: 'Feliz',
      triste: 'Triste',
      irritable: 'Irritable',
      sensible: 'Sensible',
      ansiosa: 'Ansiosa',
      calmada: 'Calmada',
      energética: 'Energética',
      cariñosa: 'Cariñosa',
    };
    return labels[m] || m;
  }).join(', ');
};

function FilterChip({ label, active = false, onPress }: { label: string, active: boolean, onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-9 px-4 rounded-full items-center justify-center shadow-md ${active ? 'bg-primary' : 'bg-white border border-gray-200'
        }`}
    >
      <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-text-muted'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

const HistoryItem = ({ log, onPress, lastPeriodStart }: { log: DailyLog, onPress: () => void, lastPeriodStart: Date }) => {
  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  };

  const getDayNumber = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.getDate().toString();
  };

  const isPeriodStart = (log: DailyLog): boolean => {
    return getCycleDay(lastPeriodStart, new Date(log.date)) === 1;
  };

  const flowColors = FLOW_COLORS[log.flow?.toLowerCase() || ''] || FLOW_COLORS.medio;
  const isStart = isPeriodStart(log);
  const dayName = getDayName(log.date);
  const dayNumber = getDayNumber(log.date);

  // React Compiler will automatically memoize this computation
  const moodChips = !log.mood ? [] : log?.mood?.split(',').map((mood) => ({
    emoji: MOOD_EMOJIS[mood.trim().toLowerCase()],
    name: getMoodLabel(mood.trim()),
  }));

  return (
    <Pressable
      onPress={onPress}
      className="flex-row rounded-3xl bg-white p-4 shadow-md active:scale-[0.99] border border-gray-100"
    >
      {/* Date Column */}
      <View className="items-center justify-center pr-4 border-r border-gray-100 min-w-[60px]">
        <Text className="text-base uppercase font-bold text-text-muted tracking-wide">
          {dayName}
        </Text>
        <Text className={`text-2xl font-black ${isStart ? 'text-primary' : 'text-text-primary'}`}>
          {dayNumber}
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 flex-col justify-center pl-4 gap-2">
        <View className="flex-row items-center gap-2 flex-wrap">
          {isStart && (
            <View className="px-2 py-0.5 rounded-md bg-primary">
              <Text className="text-xs font-bold text-white uppercase tracking-wider">
                Inicio
              </Text>
            </View>
          )}
          {log.flow && (
            <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${flowColors.bg}`}>
              <View className={`w-2 h-2 rounded-full ${flowColors.dot}`} />
              <Text className={`text-xs font-bold ${flowColors.text}`}>
                {getFlowLabel(log.flow)}
              </Text>
            </View>
          )}

          {moodChips.map((mood, index) => (
            <React.Fragment key={`${mood.name}-${index}`}>
              <Text className="text-sm font-medium text-text-primary">
                {mood.emoji} {mood.name}
              </Text>
              {index < moodChips.length - 1 && <View className={`w-2 h-2 rounded-full ${FLOW_COLORS.mancha.dot}`} />}
            </React.Fragment>
          ))}
        </View>

        {log.symptoms && log.symptoms.length > 0 ? (
          <Text className="text-sm font-medium text-text-primary leading-normal">
            {log.symptoms.join(', ')}
          </Text>
        ) : log.notes ? (
          <Text className="text-sm font-medium text-text-primary leading-normal">
            Nota: {log.notes}
          </Text>
        ) : (
          <Text className="text-sm font-medium text-text-primary leading-normal">
            Sin síntomas registrados
          </Text>
        )}
      </View>

      {/* Arrow */}
      <View className="items-center justify-center pl-2">
        <MyIcon name="ChevronRight" size={20} className="text-gray-400" />
      </View>
    </Pressable>
  );
}

function MonthSection({ group, groupIndex, lastPeriodStart }: { group: GroupedLogs, groupIndex: number, lastPeriodStart: Date }) {
  return (
    <View className={groupIndex > 0 ? 'mt-6' : ''}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-text-primary">{group.month}</Text>
        {group.cycle && (
          <View className="bg-gray-100 px-2 py-1 rounded-md">
            <Text className="text-xs font-medium text-text-muted">Ciclo {group.cycle}</Text>
          </View>
        )}
      </View>

      <View className="flex-col gap-3">
        {group.logs.map((log, index) => (
          <HistoryItem
            key={index + log.id}
            log={log}
            lastPeriodStart={lastPeriodStart}
            onPress={() => router.push({
              pathname: '/register',
              params: {
                date: log.date,
                id: log.id,
              },
            })} />
        ))}

      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { user, isAuthenticated, localUserId } = useAuth();
  const { data, isLoading: onboardingLoading, isComplete } = useOnboarding();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { lastPeriodStart } = useCyclePredictions(data);

  const userId = isAuthenticated && user ? user.id : localUserId;

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!onboardingLoading && !isComplete) {
      router.replace('/onboarding/wizard');
    }
  }, [onboardingLoading, isComplete]);

  useEffect(() => {
    if (userId) {
      loadLogs();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const loadLogs = async (isRefresh = false) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const allLogs = await DailyLogsService.getAll(userId);
      setLogs(allLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadLogs(true);
  };

  // Group logs by month
  const groupedLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = logs.filter(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      switch (filter) {
        case 'all':
          return true;
        case 'period':
          // Filter days with flow (period days)
          return !!log.flow && log.flow.trim() !== '' &&
            (log.flow.toLowerCase() === 'leve' ||
              log.flow.toLowerCase() === 'ligero' ||
              log.flow.toLowerCase() === 'medio' ||
              log.flow.toLowerCase() === 'alto' ||
              log.flow.toLowerCase() === 'abundante');
        case 'thisWeek':
          // Filter logs from the last 7 days
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate >= weekAgo && logDate <= today;
        case 'thisMonth':
          // Filter logs from current month
          return logDate.getMonth() === today.getMonth() &&
            logDate.getFullYear() === today.getFullYear();
        case 'last3Months':
          // Filter logs from last 3 months
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return logDate >= threeMonthsAgo && logDate <= today;
        default:
          return true;
      }
    });

    const grouped: GroupedLogs[] = [];
    const monthMap = new Map<string, DailyLog[]>();

    filtered.forEach(log => {
      const date = new Date(log.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, []);
      }
      monthMap.get(monthKey)!.push(log);
    });

    monthMap.forEach((monthLogs, monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);
      const date = new Date(year, month, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      // Sort logs by date (newest first)
      monthLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      grouped.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        year,
        logs: monthLogs,
      });
    });

    // Sort groups by date (newest first)
    grouped.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.logs[0] ? new Date(b.logs[0].date).getTime() - new Date(a.logs[0].date).getTime() : 0;
    });

    return grouped;
  }, [logs, filter]);


  const filters = [
    {
      label: 'Todos',
      value: 'all',
    },
    {
      label: 'Días de periodo',
      value: 'period',
    },
    {
      label: 'Esta semana',
      value: 'thisWeek',
    },
    {
      label: 'Este mes',
      value: 'thisMonth',
    },
    {
      label: 'Últimos 3 meses',
      value: 'last3Months',
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right', presentation: 'pageSheet' }} />
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
        <View className="flex-row items-center justify-between w-full">
          <Text className="text-2xl font-bold text-text-primary">
            Historial
          </Text>

          <TouchableOpacity onPress={() => router.push('/register')} className="h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
            <MyIcon name="Plus" size={20} className="text-white" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName='gap-2 py-1' className="flex-row mt-4 w-full ">
          {filters.map(({ label, value }, index) => (
            <FilterChip
              key={index}
              label={label}
              active={value === filter}
              onPress={() => setFilter(value as FilterType)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl className='z-50' refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lavender} />
        }
      >
        <View className="h-32" />
        {groupedLogs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
              <MyIcon name="History" size={48} className="text-primary" />
            </View>
            <Text className="text-text-muted text-center">
              No hay registros aún
            </Text>
          </View>
        ) : (
          <>
            {groupedLogs.map((group, groupIndex) => (
              <MonthSection
                key={groupIndex}
                group={group}
                groupIndex={groupIndex}
                lastPeriodStart={lastPeriodStart}
              />
            ))}

            {/* End of list */}
            {groupedLogs.length > 0 && (
              <View className="items-center justify-center py-8 opacity-60">
                <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
                  <MyIcon name="FileText" size={48} className="text-primary" />
                </View>
                <Text className="text-text-muted text-sm text-center">
                  No hay más registros anteriores.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

