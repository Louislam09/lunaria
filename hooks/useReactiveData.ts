import React from 'react';
import { useTable, useRow, useCell } from 'tinybase/ui-react';
import { getStore } from '@/services/database';
import { parseJsonArray, intToBool } from '@/utils/dbHelpers';

/**
 * Reactive hook to get all daily logs for a user
 * Automatically re-renders when logs change
 */
export function useDailyLogs(userId: string) {
  const store = getStore();
  const dailyLogsTable = useTable('daily_logs', store);

  // Filter by user_id and transform data
  const logs = React.useMemo(() => {
    return Object.entries(dailyLogsTable)
      .filter(([_, row]) => row.user_id === userId)
      .map(([id, row]) => ({
        id,
        date: row.date as string,
        symptoms: parseJsonArray<string>(row.symptoms as string),
        flow: row.flow as string,
        mood: row.mood as string,
        notes: row.notes as string,
        synced: intToBool(row.synced as number),
        updated_at: row.updated_at as string,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyLogsTable, userId]);

  return logs;
}

/**
 * Reactive hook to get a specific daily log by date
 */
export function useDailyLogByDate(userId: string, date: string) {
  const store = getStore();
  const dailyLogsTable = useTable('daily_logs', store);

  const log = React.useMemo(() => {
    const entry = Object.entries(dailyLogsTable).find(
      ([_, row]) => row.user_id === userId && row.date === date
    );

    if (!entry) return null;

    const [id, row] = entry;
    return {
      id,
      date: row.date as string,
      symptoms: parseJsonArray<string>(row.symptoms as string),
      flow: row.flow as string,
      mood: row.mood as string,
      notes: row.notes as string,
      synced: intToBool(row.synced as number),
      updated_at: row.updated_at as string,
    };
  }, [dailyLogsTable, userId, date]);

  return log;
}

/**
 * Reactive hook to get all cycles for a user
 */
export function useCycles(userId: string) {
  const store = getStore();
  const cyclesTable = useTable('cycles', store);

  const cycles = React.useMemo(() => {
    return Object.entries(cyclesTable)
      .filter(([_, row]) => row.user_id === userId)
      .map(([id, row]) => ({
        id,
        start_date: row.start_date as string,
        end_date: row.end_date as string | null,
        delay: (row.delay as number) || 0,
        synced: intToBool(row.synced as number),
      }))
      .sort((a, b) => b.start_date.localeCompare(a.start_date));
  }, [cyclesTable, userId]);

  return cycles;
}

/**
 * Reactive hook to get a cycle by start date
 */
export function useCycleByStartDate(userId: string, startDate: string) {
  const store = getStore();
  const cyclesTable = useTable('cycles', store);

  const cycle = React.useMemo(() => {
    const entry = Object.entries(cyclesTable).find(
      ([_, row]) => row.user_id === userId && row.start_date === startDate
    );

    if (!entry) return null;

    const [id, row] = entry;
    return {
      id,
      start_date: row.start_date as string,
      end_date: row.end_date as string | null,
      delay: (row.delay as number) || 0,
      synced: intToBool(row.synced as number),
    };
  }, [cyclesTable, userId, startDate]);

  return cycle;
}

/**
 * Reactive hook to get profile for a user
 */
export function useProfile(userId: string) {
  const store = getStore();
  const profilesTable = useTable('profiles', store);

  const profile = React.useMemo(() => {
    const entry = Object.entries(profilesTable).find(
      ([_, row]) => row.user_id === userId
    );

    if (!entry) return null;

    const [id, row] = entry;
    return {
      id,
      user_id: row.user_id as string,
      name: row.name as string | null,
      birth_date: row.birth_date as string | null,
      cycle_type: row.cycle_type as string | null,
      average_cycle_length: row.average_cycle_length as number | null,
      cycle_range_min: row.cycle_range_min as number | null,
      cycle_range_max: row.cycle_range_max as number | null,
      period_length: row.period_length as number | null,
      has_pcos: intToBool(row.has_pcos as number),
      pcos_symptoms: parseJsonArray<string>(row.pcos_symptoms as string),
      pcos_treatment: parseJsonArray<string>(row.pcos_treatment as string),
      contraceptive_method: row.contraceptive_method as string | null,
      wants_pregnancy: row.wants_pregnancy !== null ? intToBool(row.wants_pregnancy as number) : null,
      synced: intToBool(row.synced as number),
    };
  }, [profilesTable, userId]);

  return profile;
}
