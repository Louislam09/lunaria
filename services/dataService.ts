import { getStore } from './database';
import {
  intToBool,
  boolToInt,
  parseJsonArray,
  stringifyJsonArray,
} from '@/utils/dbHelpers';

// Daily Logs Service
export const DailyLogsService = {
  // Save log locally (works offline)
  async save(log: {
    id?: string;
    user_id: string;
    date: string;
    symptoms: string[];
    flow: string;
    mood: string;
    notes: string;
  }): Promise<string> {
    const store = getStore();
    const id = log.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save log to daily_logs table
    store.setRow('daily_logs', id, {
      user_id: log.user_id,
      date: log.date,
      symptoms: stringifyJsonArray(log.symptoms),
      flow: log.flow || null,
      mood: log.mood || null,
      notes: log.notes || null,
      synced: 0,
      updated_at: new Date().toISOString(),
    });

    // Queue for sync
    const syncQueueId = `sync_${id}`;
    store.setRow('sync_queue', syncQueueId, {
      table_name: 'daily_logs',
      record_id: id,
      operation: 'create',
      data: JSON.stringify({
        user: log.user_id,
        date: log.date,
        symptoms: log.symptoms,
        flow: log.flow,
        mood: log.mood,
        notes: log.notes,
      }),
      created_at: new Date().toISOString(),
    });

    return id;
  },

  // Update log
  async update(id: string, updates: Partial<{
    symptoms: string[];
    flow: string;
    mood: string;
    notes: string;
  }>): Promise<void> {
    const store = getStore();

    // Get existing log
    const existing = store.getRow('daily_logs', id);
    if (!existing) throw new Error('Log not found');

    const updated = {
      symptoms: updates.symptoms || parseJsonArray<string>(existing.symptoms as string),
      flow: updates.flow !== undefined ? updates.flow : (existing.flow as string),
      mood: updates.mood !== undefined ? updates.mood : (existing.mood as string),
      notes: updates.notes !== undefined ? updates.notes : (existing.notes as string),
    };

    // Update log
    store.setCell('daily_logs', id, 'symptoms', stringifyJsonArray(updated.symptoms));
    store.setCell('daily_logs', id, 'flow', updated.flow);
    store.setCell('daily_logs', id, 'mood', updated.mood);
    store.setCell('daily_logs', id, 'notes', updated.notes);
    store.setCell('daily_logs', id, 'synced', 0);
    store.setCell('daily_logs', id, 'updated_at', new Date().toISOString());

    // Queue for sync
    const syncQueueId = `sync_${id}`;
    store.setRow('sync_queue', syncQueueId, {
      table_name: 'daily_logs',
      record_id: id,
      operation: 'update',
      data: JSON.stringify({
        user: existing.user_id as string,
        date: existing.date as string,
        ...updated,
      }),
      created_at: new Date().toISOString(),
    });
  },

  // Get all logs for user
  async getAll(userId: string): Promise<Array<{
    id: string;
    date: string;
    symptoms: string[];
    flow: string;
    mood: string;
    notes: string;
    synced: boolean;
    updated_at: string;
  }>> {
    const store = getStore();
    const table = store.getTable('daily_logs');

    // Filter by user_id and sort by date DESC
    const logs = Object.entries(table)
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

    return logs;
  },

  // Get log for specific date
  async getByDate(userId: string, date: string): Promise<{
    id: string;
    date: string;
    symptoms: string[];
    flow: string;
    mood: string;
    notes: string;
    synced: boolean;
    updated_at: string;
  } | null> {
    const store = getStore();
    const table = store.getTable('daily_logs');

    // Find log matching user_id and date
    const entry = Object.entries(table).find(
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
  },

  // Delete log
  async delete(id: string): Promise<void> {
    const store = getStore();
    store.delRow('daily_logs', id);

    // Queue delete for sync
    const syncQueueId = `sync_delete_${id}`;
    store.setRow('sync_queue', syncQueueId, {
      table_name: 'daily_logs',
      record_id: id,
      operation: 'delete',
      data: null,
      created_at: new Date().toISOString(),
    });
  },
};

// Profiles Service
export const ProfilesService = {
  // Save profile locally
  async save(profile: {
    id?: string;
    user_id: string;
    name?: string;
    birth_date?: string;
    cycle_type?: string;
    average_cycle_length?: number;
    cycle_range_min?: number;
    cycle_range_max?: number;
    period_length?: number;
    has_pcos?: boolean;
    pcos_symptoms?: string[];
    pcos_treatment?: string[];
    contraceptive_method?: string;
    wants_pregnancy?: boolean;
  }): Promise<string> {
    const store = getStore();
    const id = profile.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save profile
    store.setRow('profiles', id, {
      user_id: profile.user_id,
      name: profile.name || null,
      birth_date: profile.birth_date || null,
      cycle_type: profile.cycle_type || null,
      average_cycle_length: profile.average_cycle_length || null,
      cycle_range_min: profile.cycle_range_min || null,
      cycle_range_max: profile.cycle_range_max || null,
      period_length: profile.period_length || null,
      has_pcos: boolToInt(profile.has_pcos),
      pcos_symptoms: stringifyJsonArray(profile.pcos_symptoms),
      pcos_treatment: stringifyJsonArray(profile.pcos_treatment),
      contraceptive_method: profile.contraceptive_method || null,
      wants_pregnancy: profile.wants_pregnancy !== undefined ? boolToInt(profile.wants_pregnancy) : null,
      synced: 0,
      updated_at: new Date().toISOString(),
    });

    // Queue for sync
    const syncQueueId = `sync_${id}`;
    store.setRow('sync_queue', syncQueueId, {
      table_name: 'profiles',
      record_id: id,
      operation: 'create',
      data: JSON.stringify({
        user: profile.user_id,
        name: profile.name,
        birthDate: profile.birth_date,
        cycleType: profile.cycle_type,
        averageCycleLength: profile.average_cycle_length,
        cycleRangeMin: profile.cycle_range_min,
        cycleRangeMax: profile.cycle_range_max,
        averagePeriodLength: profile.period_length,
        hasPCOS: profile.has_pcos,
        pcosSymptoms: profile.pcos_symptoms,
        pcosTreatment: profile.pcos_treatment,
        contraceptiveMethod: profile.contraceptive_method,
        wantsPregnancy: profile.wants_pregnancy,
      }),
      created_at: new Date().toISOString(),
    });

    return id;
  },

  // Get profile for user
  async getByUserId(userId: string): Promise<{
    id: string;
    user_id: string;
    name: string | null;
    birth_date: string | null;
    cycle_type: string | null;
    average_cycle_length: number | null;
    cycle_range_min: number | null;
    cycle_range_max: number | null;
    period_length: number | null;
    has_pcos: boolean;
    pcos_symptoms: string[];
    pcos_treatment: string[];
    contraceptive_method: string | null;
    wants_pregnancy: boolean | null;
    synced: boolean;
  } | null> {
    const store = getStore();
    const table = store.getTable('profiles');

    // Find profile matching user_id
    const entry = Object.entries(table).find(
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
  },
};

// Cycles Service
export const CyclesService = {
  // Save cycle locally
  async save(cycle: {
    id?: string;
    user_id: string;
    start_date: string;
    end_date?: string;
    delay?: number;
  }): Promise<string> {
    const store = getStore();
    const id = cycle.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save cycle
    store.setRow('cycles', id, {
      user_id: cycle.user_id,
      start_date: cycle.start_date,
      end_date: cycle.end_date || null,
      delay: cycle.delay || 0,
      synced: 0,
      updated_at: new Date().toISOString(),
    });

    // Queue for sync
    const syncQueueId = `sync_${id}`;
    store.setRow('sync_queue', syncQueueId, {
      table_name: 'cycles',
      record_id: id,
      operation: 'create',
      data: JSON.stringify({
        user: cycle.user_id,
        startDate: cycle.start_date,
        endDate: cycle.end_date,
        delay: cycle.delay || 0,
      }),
      created_at: new Date().toISOString(),
    });

    return id;
  },

  // Get all cycles for user
  async getAll(userId: string): Promise<Array<{
    id: string;
    start_date: string;
    end_date: string | null;
    delay: number;
    synced: boolean;
  }>> {
    const store = getStore();
    const table = store.getTable('cycles');

    // Filter by user_id and sort by start_date DESC
    const cycles = Object.entries(table)
      .filter(([_, row]) => row.user_id === userId)
      .map(([id, row]) => ({
        id,
        start_date: row.start_date as string,
        end_date: row.end_date as string | null,
        delay: (row.delay as number) || 0,
        synced: intToBool(row.synced as number),
      }))
      .sort((a, b) => b.start_date.localeCompare(a.start_date));

    return cycles;
  },

  // Get cycle by start date
  async getByStartDate(userId: string, startDate: string): Promise<{
    id: string;
    start_date: string;
    end_date: string | null;
    delay: number;
    synced: boolean;
  } | null> {
    const store = getStore();
    const table = store.getTable('cycles');

    // Find cycle matching user_id and start_date
    const entry = Object.entries(table).find(
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
  },

  // Mark delay on a cycle (creates cycle if doesn't exist)
  async markDelay(userId: string, predictedStartDate: string, delayDays: number): Promise<string> {
    // Check if cycle already exists for this predicted date
    const existing = await this.getByStartDate(userId, predictedStartDate);

    if (existing) {
      const store = getStore();

      // Update existing cycle with delay
      store.setCell('cycles', existing.id, 'delay', delayDays);
      store.setCell('cycles', existing.id, 'synced', 0);
      store.setCell('cycles', existing.id, 'updated_at', new Date().toISOString());

      // Queue for sync
      const syncQueueId = `sync_${existing.id}`;
      store.setRow('sync_queue', syncQueueId, {
        table_name: 'cycles',
        record_id: existing.id,
        operation: 'update',
        data: JSON.stringify({
          user: userId,
          startDate: existing.start_date,
          endDate: existing.end_date,
          delay: delayDays,
        }),
        created_at: new Date().toISOString(),
      });

      return existing.id;
    } else {
      // Create new cycle record with delay
      return await this.save({
        user_id: userId,
        start_date: predictedStartDate,
        end_date: null,
        delay: delayDays,
      });
    }
  },

  // Mark period end - updates the most recent cycle without end_date
  async markPeriodEnd(userId: string, endDate: string, startDate?: string): Promise<string> {
    const store = getStore();
    const table = store.getTable('cycles');

    // Find the most recent cycle without an end_date
    const cyclesWithoutEnd = Object.entries(table)
      .filter(([_, row]) => row.user_id === userId && !row.end_date)
      .map(([id, row]) => ({
        id,
        start_date: row.start_date as string,
        end_date: row.end_date as string | null,
        delay: (row.delay as number) || 0,
        synced: intToBool(row.synced as number),
      }))
      .sort((a, b) => b.start_date.localeCompare(a.start_date));

    if (cyclesWithoutEnd.length > 0) {
      // Update existing cycle with end_date
      const cycle = cyclesWithoutEnd[0];
      store.setCell('cycles', cycle.id, 'end_date', endDate);
      store.setCell('cycles', cycle.id, 'synced', 0);
      store.setCell('cycles', cycle.id, 'updated_at', new Date().toISOString());

      // Queue for sync
      const syncQueueId = `sync_${cycle.id}`;
      store.setRow('sync_queue', syncQueueId, {
        table_name: 'cycles',
        record_id: cycle.id,
        operation: 'update',
        data: JSON.stringify({
          user: userId,
          startDate: cycle.start_date,
          endDate: endDate,
          delay: cycle.delay,
        }),
        created_at: new Date().toISOString(),
      });

      return cycle.id;
    } else if (startDate) {
      // No cycle found, create a new one with start_date and end_date
      return await this.save({
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        delay: 0,
      });
    } else {
      throw new Error('No cycle found to mark end and no start_date provided');
    }
  },
};
