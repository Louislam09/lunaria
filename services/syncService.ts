import { getStore } from './database';
import { pb } from './pocketbase';
import { intToBool, boolToInt } from '@/utils/dbHelpers';

export type SyncFrequency = 'daily' | 'weekly' | 'monthly';

// Get sync frequency from settings
export async function getSyncFrequency(): Promise<SyncFrequency> {
  const store = getStore();
  const row = store.getRow('sync_settings', 'sync_frequency');
  return (row?.value as SyncFrequency) || 'daily';
}

// Set sync frequency
export async function setSyncFrequency(frequency: SyncFrequency): Promise<void> {
  const store = getStore();
  store.setRow('sync_settings', 'sync_frequency', {
    value: frequency,
    updated_at: new Date().toISOString(),
  });
}

// Check if sync is needed based on last sync time and frequency
export async function shouldSync(): Promise<boolean> {
  const frequency = await getSyncFrequency();
  const store = getStore();
  const row = store.getRow('sync_settings', 'last_sync_time');

  if (!row || !row.value) return true; // Never synced

  const lastSync = new Date(row.value as string);
  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();

  switch (frequency) {
    case 'daily':
      return diffMs >= 24 * 60 * 60 * 1000; // 24 hours
    case 'weekly':
      return diffMs >= 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'monthly':
      return diffMs >= 30 * 24 * 60 * 60 * 1000; // 30 days
    default:
      return true;
  }
}

// Perform sync: push local changes to PocketBase
export async function syncToPocketBase(): Promise<{ success: number; failed: number }> {
  const store = getStore();
  const queueTable = store.getTable('sync_queue');

  let success = 0;
  let failed = 0;

  // Get all queue items sorted by created_at
  const queueItems = Object.entries(queueTable)
    .map(([id, row]) => ({
      id,
      table_name: row.table_name as string,
      record_id: row.record_id as string,
      operation: row.operation as string,
      data: row.data as string | null,
    }))
    .sort((a, b) => {
      // Sort by created_at if available, otherwise by id
      const aRow = queueTable[a.id];
      const bRow = queueTable[b.id];
      const aTime = aRow.created_at as string;
      const bTime = bRow.created_at as string;
      if (aTime && bTime) {
        return aTime.localeCompare(bTime);
      }
      return a.id.localeCompare(b.id);
    });

  for (const item of queueItems) {
    try {
      const data = item.data ? JSON.parse(item.data) : {};

      if (item.operation === 'create') {
        const result = await pb.collection(item.table_name).create(data);

        // Update local record with PocketBase ID
        const tableName = item.table_name as 'profiles' | 'daily_logs' | 'cycles';
        store.setCell(tableName, item.record_id, 'id', result.id);
        store.setCell(tableName, item.record_id, 'synced', 1);
      } else if (item.operation === 'update') {
        await pb.collection(item.table_name).update(item.record_id, data);
        const tableName = item.table_name as 'profiles' | 'daily_logs' | 'cycles';
        store.setCell(tableName, item.record_id, 'synced', 1);
      } else if (item.operation === 'delete') {
        await pb.collection(item.table_name).delete(item.record_id);
      }

      // Remove from queue
      store.delRow('sync_queue', item.id);
      success++;
    } catch (error: any) {
      console.error(`Sync failed for ${item.table_name}/${item.record_id}:`, error);
      failed++;

      // If it's a validation error, remove from queue
      if (error?.status === 400 || error?.status === 404) {
        store.delRow('sync_queue', item.id);
      }
    }
  }

  // Update last sync time
  store.setRow('sync_settings', 'last_sync_time', {
    value: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return { success, failed };
}

// Sync from PocketBase to local DB
export async function syncFromPocketBase(userId: string): Promise<void> {
  const store = getStore();

  try {
    // Fetch from PocketBase
    const [profiles, logs, cycles] = await Promise.all([
      pb.collection('profiles').getFullList({ filter: `user = "${userId}"` }).catch(() => []),
      pb.collection('daily_logs').getFullList({ filter: `user = "${userId}"` }).catch(() => []),
      pb.collection('cycles').getFullList({ filter: `user = "${userId}"` }).catch(() => []),
    ]);

    // Save profiles to local DB
    for (const profile of profiles) {
      store.setRow('profiles', profile.id, {
        user_id: profile.user,
        name: profile.name || null,
        birth_date: profile.birthDate || null,
        cycle_type: profile.cycleType || null,
        average_cycle_length: profile.averageCycleLength || null,
        cycle_range_min: profile.cycleRangeMin || null,
        cycle_range_max: profile.cycleRangeMax || null,
        period_length: profile.averagePeriodLength || null,
        has_pcos: boolToInt(profile.hasPCOS),
        pcos_symptoms: JSON.stringify(profile.pcosSymptoms || []),
        pcos_treatment: JSON.stringify(profile.pcosTreatment || []),
        contraceptive_method: profile.contraceptiveMethod || null,
        wants_pregnancy: profile.wantsPregnancy !== undefined ? boolToInt(profile.wantsPregnancy) : null,
        synced: 1,
        updated_at: profile.updated || new Date().toISOString(),
      });
    }

    // Save daily logs to local DB
    for (const log of logs) {
      store.setRow('daily_logs', log.id, {
        user_id: log.user,
        date: log.date,
        symptoms: JSON.stringify(log.symptoms || []),
        flow: log.flow || null,
        mood: log.mood || null,
        notes: log.notes || null,
        synced: 1,
        updated_at: log.updated || new Date().toISOString(),
      });
    }

    // Save cycles to local DB
    for (const cycle of cycles) {
      store.setRow('cycles', cycle.id, {
        user_id: cycle.user,
        start_date: cycle.startDate,
        end_date: cycle.endDate || null,
        delay: cycle.delay || 0,
        synced: 1,
        updated_at: cycle.updated || new Date().toISOString(),
      });
    }

    // Update last sync time
    store.setRow('sync_settings', 'last_sync_time', {
      value: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync from PocketBase failed:', error);
    throw error;
  }
}

// Perform full sync (both directions)
export async function performSync(userId?: string): Promise<{ success: number; failed: number; conflicts?: number }> {
  if (!userId && pb.authStore.model) {
    userId = pb.authStore.model.id;
  }

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // First sync from PocketBase (get latest data)
  await syncFromPocketBase(userId);

  // Auto-resolve conflicts with local preference
  const { autoResolveConflicts } = await import('./conflictResolution');
  const conflictsResolved = await autoResolveConflicts(userId);

  // Then sync to PocketBase (push local changes)
  const result = await syncToPocketBase();

  return { ...result, conflicts: conflictsResolved };
}

// Get sync status
export async function getSyncStatus(): Promise<{
  lastSyncTime: Date | null;
  pendingItems: number;
  frequency: SyncFrequency;
}> {
  const store = getStore();

  const lastSyncRow = store.getRow('sync_settings', 'last_sync_time');
  const queueTable = store.getTable('sync_queue');
  const frequencyRow = store.getRow('sync_settings', 'sync_frequency');

  return {
    lastSyncTime: lastSyncRow?.value ? new Date(lastSyncRow.value as string) : null,
    pendingItems: Object.keys(queueTable).length,
    frequency: (frequencyRow?.value as SyncFrequency) || 'daily',
  };
}
