import { getDatabase } from './database';
import { pb } from './pocketbase';
import * as SQLite from 'expo-sqlite';

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
    const db = await getDatabase();
    const id = log.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.runAsync(
      `INSERT OR REPLACE INTO daily_logs 
       (id, user_id, date, symptoms, flow, mood, notes, synced, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [
        id,
        log.user_id,
        log.date,
        JSON.stringify(log.symptoms || []),
        log.flow,
        log.mood,
        log.notes,
      ]
    );

    // Queue for sync
    await db.runAsync(
      `INSERT INTO sync_queue (id, table_name, record_id, operation, data)
       VALUES (?, 'daily_logs', ?, 'create', ?)`,
      [
        `sync_${id}`,
        id,
        JSON.stringify({
          user: log.user_id,
          date: log.date,
          symptoms: log.symptoms,
          flow: log.flow,
          mood: log.mood,
          notes: log.notes,
        }),
      ]
    );

    return id;
  },

  // Update log
  async update(id: string, updates: Partial<{
    symptoms: string[];
    flow: string;
    mood: string;
    notes: string;
  }>): Promise<void> {
    const db = await getDatabase();
    
    // Get existing log
    const existing = await db.getFirstAsync<{
      user_id: string;
      date: string;
      symptoms: string;
      flow: string;
      mood: string;
      notes: string;
    }>(`SELECT * FROM daily_logs WHERE id = ?`, [id]);

    if (!existing) throw new Error('Log not found');

    const updated = {
      symptoms: updates.symptoms || JSON.parse(existing.symptoms || '[]'),
      flow: updates.flow || existing.flow,
      mood: updates.mood || existing.mood,
      notes: updates.notes !== undefined ? updates.notes : existing.notes,
    };

    await db.runAsync(
      `UPDATE daily_logs 
       SET symptoms = ?, flow = ?, mood = ?, notes = ?, synced = 0, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [JSON.stringify(updated.symptoms), updated.flow, updated.mood, updated.notes, id]
    );

    // Queue for sync
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_queue (id, table_name, record_id, operation, data)
       VALUES (?, 'daily_logs', ?, 'update', ?)`,
      [
        `sync_${id}`,
        id,
        JSON.stringify({
          user: existing.user_id,
          date: existing.date,
          ...updated,
        }),
      ]
    );
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
    const db = await getDatabase();
    const result = await db.getAllAsync<{
      id: string;
      date: string;
      symptoms: string;
      flow: string;
      mood: string;
      notes: string;
      synced: number;
      updated_at: string;
    }>(`SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date DESC`, [userId]);

    return result.map((row) => ({
      ...row,
      symptoms: JSON.parse(row.symptoms || '[]'),
      synced: Boolean(row.synced),
    }));
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
    const db = await getDatabase();
    const result = await db.getFirstAsync<{
      id: string;
      date: string;
      symptoms: string;
      flow: string;
      mood: string;
      notes: string;
      synced: number;
      updated_at: string;
    }>(`SELECT * FROM daily_logs WHERE user_id = ? AND date = ?`, [userId, date]);

    if (!result) return null;

    return {
      ...result,
      symptoms: JSON.parse(result.symptoms || '[]'),
      synced: Boolean(result.synced),
    };
  },

  // Delete log
  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM daily_logs WHERE id = ?`, [id]);
    
    // Queue delete for sync
    await db.runAsync(
      `INSERT INTO sync_queue (id, table_name, record_id, operation, data)
       VALUES (?, 'daily_logs', ?, 'delete', NULL)`,
      [`sync_delete_${id}`, id]
    );
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
    const db = await getDatabase();
    const id = profile.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.runAsync(
      `INSERT OR REPLACE INTO profiles 
       (id, user_id, name, birth_date, cycle_type, average_cycle_length,
        cycle_range_min, cycle_range_max, period_length, has_pcos,
        pcos_symptoms, pcos_treatment, contraceptive_method, wants_pregnancy, synced, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [
        id,
        profile.user_id,
        profile.name,
        profile.birth_date,
        profile.cycle_type,
        profile.average_cycle_length,
        profile.cycle_range_min,
        profile.cycle_range_max,
        profile.period_length,
        profile.has_pcos ? 1 : 0,
        JSON.stringify(profile.pcos_symptoms || []),
        JSON.stringify(profile.pcos_treatment || []),
        profile.contraceptive_method,
        profile.wants_pregnancy ? 1 : 0,
      ]
    );

    // Queue for sync
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_queue (id, table_name, record_id, operation, data)
       VALUES (?, 'profiles', ?, 'create', ?)`,
      [
        `sync_${id}`,
        id,
        JSON.stringify({
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
      ]
    );

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
    const db = await getDatabase();
    const result = await db.getFirstAsync<{
      id: string;
      user_id: string;
      name: string | null;
      birth_date: string | null;
      cycle_type: string | null;
      average_cycle_length: number | null;
      cycle_range_min: number | null;
      cycle_range_max: number | null;
      period_length: number | null;
      has_pcos: number;
      pcos_symptoms: string;
      pcos_treatment: string;
      contraceptive_method: string | null;
      wants_pregnancy: number | null;
      synced: number;
    }>(`SELECT * FROM profiles WHERE user_id = ?`, [userId]);

    if (!result) return null;

    return {
      ...result,
      has_pcos: Boolean(result.has_pcos),
      pcos_symptoms: JSON.parse(result.pcos_symptoms || '[]'),
      pcos_treatment: JSON.parse(result.pcos_treatment || '[]'),
      wants_pregnancy: result.wants_pregnancy !== null ? Boolean(result.wants_pregnancy) : null,
      synced: Boolean(result.synced),
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
  }): Promise<string> {
    const db = await getDatabase();
    const id = cycle.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.runAsync(
      `INSERT OR REPLACE INTO cycles 
       (id, user_id, start_date, end_date, synced, updated_at)
       VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [id, cycle.user_id, cycle.start_date, cycle.end_date]
    );

    // Queue for sync
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_queue (id, table_name, record_id, operation, data)
       VALUES (?, 'cycles', ?, 'create', ?)`,
      [
        `sync_${id}`,
        id,
        JSON.stringify({
          user: cycle.user_id,
          startDate: cycle.start_date,
          endDate: cycle.end_date,
        }),
      ]
    );

    return id;
  },

  // Get all cycles for user
  async getAll(userId: string): Promise<Array<{
    id: string;
    start_date: string;
    end_date: string | null;
    synced: boolean;
  }>> {
    const db = await getDatabase();
    const result = await db.getAllAsync<{
      id: string;
      start_date: string;
      end_date: string | null;
      synced: number;
    }>(`SELECT * FROM cycles WHERE user_id = ? ORDER BY start_date DESC`, [userId]);

    return result.map((row) => ({
      ...row,
      synced: Boolean(row.synced),
    }));
  },
};

